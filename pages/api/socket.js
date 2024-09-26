import {Server} from 'Socket.IO'
import fs from 'fs'

import QUESTION_CONFIG from '../../lib/questions'
import questions from '../../lib/questions'
import buzzer from '../buzzer'

const STATE_FILE_PATH = './state.json'
let state


const emptyTeam = {
    name: 'Team',
    score: 0
}
const emptyState = {
    questionNum: 0,
    teamOnTurn: 0,
    buzzerOpened: false,
    bank: 0,
    teams: [
        { ...emptyTeam },
        { ...emptyTeam }
    ],
    questions: []
}
QUESTION_CONFIG.questions.forEach(q => {
    emptyState.questions.push({
        xs: 0,
        showQuestion: false,
        showAnswers: new Array(8).fill(false)
    })
})

const SocketHandler = (req, res) => {
    if (res.socket.server.io) {
        console.log('Socket is already running')
    } else {
        try {
            console.log('Initializing state')
            const rawState = fs.readFileSync(STATE_FILE_PATH)
            state = JSON.parse(rawState)
            console.log('State parsed')
        } catch (e) {
            console.error(e)
            state = emptyState
            console.log('State reset')
            saveState()
        }

        console.log('Socket is initializing')
        const io = new Server(res.socket.server)
        res.socket.server.io = io

        io.on('connection', socket => {

            const updateState = () => {
                socket.broadcast.emit('set-state', state)
                saveState()
            }

            socket.emit('set-state', state)

            socket.on('input-change', msg => {
                socket.broadcast.emit('update-input', msg)
                console.log(msg)
            })

            socket.on('set-team-turn', teamId => {
                state.teamOnTurn = teamId
                state.buzzerOpened = false;
                updateState()
            })

            socket.on('set-question', questionId => {
                state.teamOnTurn = -1
                state.bank = 0
                state.questionNum = questionId
                updateState()
            })

            socket.on('set-buzzer', opened => {
                console.log('set-buzzer', opened)
                state.buzzerOpened = opened
                updateState()
            })

            socket.on('show-question', questionId => {
                state.questionNum = questionId
                state.questions[questionId].showQuestion = !state.questions[questionId].showQuestion
                updateState()
            })

            socket.on('show-answer', answerId => {
                const question = QUESTION_CONFIG.questions[state.questionNum]
                const points = question.answers[answerId].points * question.multiplier
                const isShown = state.questions[state.questionNum].showAnswers[answerId]

                if(state.teamOnTurn >=0 ) {
                    if (isShown) {
                        state.bank -= points
                    } else {
                        socket.broadcast.emit('ding')
                        state.bank += points
                    }
                }

                state.questions[state.questionNum].showAnswers[answerId] = !isShown
                updateState()
            })

            socket.on('add-points', () => {
                state.teams[state.teamOnTurn].score += state.bank
                updateState()
            })

            socket.on('remove-points', () => {
                state.teams[state.teamOnTurn].score -= state.bank
                updateState()
            })

            socket.on('add-x', () => {
                socket.broadcast.emit('buzz')
                const question =  state.questions[state.questionNum]
                if(state.teamOnTurn >= 0) {
                    question.xs = Math.min(question.xs + 1, 3)
                }
                updateState()
            })

            socket.on('remove-x', () => {
                state.questions[state.questionNum].xs = Math.max(state.questions[state.questionNum].xs - 1, 0)
                updateState()
            })

            socket.on('*', (event, data) => {
                console.log(event, data)
            })
        })
    }
    res.end()
}

const saveState = () => {
    fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(state, null, '\t'))
    console.log('State saved')
}

export default SocketHandler
