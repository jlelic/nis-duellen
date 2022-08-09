import '../node_modules/animate.css/animate.css'

import {useEffect, useState} from 'react'
import io from 'Socket.IO-client'

import QUESTION_CONFIG from '../lib/questions'
import clsx from 'clsx'

import styles from '../styles/Admin.module.css'


let socket

const Admin = () => {
    const [input, setInput] = useState('')
    const [state, setState] = useState()
    const [added, setAdded] = useState(false)

    const questions = QUESTION_CONFIG.questions

    useEffect(() => {
        socketInitializer()
    }, [])

    const socketInitializer = async () => {
        await fetch('/api/socket')
        socket = io()

        socket.on('connect', () => {
            console.log('connected')
        })

        socket.on('set-state', msg => {
            console.log(msg)
            setState(msg)
        })

        socket.on('update-input', msg => {
            setInput(msg)
        })
    }

    if (!state) {
        return <div>Loading...</div>
    }
    const questionNum = state.questionNum

    const showQuestion = () => {
        socket.emit('show-question', questionNum)
    }

    const showAnswer = (answerId) => {
        socket.emit('show-answer', answerId)
    }


    const goNext = () => {
        setAdded(false)
        socket.emit('set-question', Math.min(questionNum + 1, questions.length - 1))
    }

    const goBack = () => {
        setAdded(false)
        socket.emit('set-question', Math.max(questionNum - 1, 0))
    }

    const addPoints = () => {
        setAdded(true)
        socket.emit('add-points')
    }

    const removePoints = () => {
        setAdded(false)
        socket.emit('remove-points')
    }

    const setTeamTurn = (teamId) => {
        socket.emit('set-team-turn', teamId)
    }


    const addX = () => {
        socket.emit('add-x')
    }

    const removeX = () => {
        socket.emit('remove-x')
    }


    const question = questions[questionNum]
    const { answers } = question
    const questionState = state.questions[questionNum]

    return (
        <div className={clsx(styles.main)}>
            <div>
                {
                    !questionState.showQuestion &&
                    <div>
                        <div className={clsx(styles.button)} onClick={() => showQuestion()}>
                            OPEN BUZZER
                        </div>
                    </div>
                }
                <div className={styles.group}>
                    <div
                        className={clsx(styles.button, styles.team, state.teamOnTurn === 0 ? styles.shown : styles.hidden)}
                        onClick={() => setTeamTurn(0)}
                    >
                        <div>
                            {state.teams[0].name}
                        </div>
                        {/*<div>*/}
                        {/*    {state.teams[0].score}*/}
                        {/*</div>*/}
                    </div>
                    <div
                        className={clsx(styles.team, styles.button, state.teamOnTurn === -1 ? styles.shown : styles.hidden)}
                        onClick={() => setTeamTurn(-1)}
                    >
                        NO ONE
                    </div>
                    <div
                        className={clsx(styles.button, styles.team, state.teamOnTurn === 1 ? styles.shown : styles.hidden)}
                        onClick={() => setTeamTurn(1)}
                    >
                        <div>
                            {state.teams[1].name}
                        </div>
                        {/*<div>*/}
                        {/*    {state.teams[1].score}*/}
                        {/*</div>*/}
                    </div>
                </div>

                <br/>
                <br/>
                <div>
                    <div
                        onClick={() => showQuestion()}
                        className={clsx(styles.button, styles.question, questionState.showQuestion ? styles.shown : styles.hidden)}
                    >
                        {questionNum+1}. {question.question}
                    </div>
                    {
                        question.answers.map((answer, answerId) => {
                                if (!answer) {
                                    return null
                                }
                                return <div key={"answer " + answerId}
                                            className={clsx(styles.button, styles.answer, questionState.showAnswers[answerId] ? styles.shown : styles.hidden)}
                                            onClick={() => showAnswer(answerId)}
                                >
                                    {answerId + 1}. {answer.answer}
                                    {/*<div>{answer.points != 0 && answer.points}</div>*/}
                                </div>
                            }
                        )
                    }
                </div>

                <br/>

                <div onClick={addX} className={clsx(styles.wrong, styles.button)}>WRONG!</div>

                <div onClick={removeX} className={clsx(styles.button)}>Take back X</div>
                <br/>


                <div>
                    {!added ? <div onClick={addPoints} className={clsx(styles.button, styles.addPoints, 'animate__animated animate__delay-3s animate__pulse animate__infinite')}>
                            ADD POINTS
                        </div>
                        :
                        <div onClick={removePoints} className={clsx(styles.button)}>
                            REMOVE POINTS
                        </div>
                    }
                </div>

                <br/>
                <br/>
                <br/>
                <br/>

                <div className={styles.group}>
                    <div className={styles.button} onClick={goBack}>
                        &lt; BACK
                    </div>
                    <div className={styles.button} onClick={goNext}>
                        NEXT &gt;
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Admin
