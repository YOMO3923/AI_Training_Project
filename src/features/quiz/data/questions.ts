import type { QuizQuestion } from '../types/quiz';

const quizData: QuizQuestion[] = [
  {
    number: 1,
    question: "Q1:What is the capital of France?", 
    options: ["Paris", "London", "Berlin", "Madrid"],
    answerIndex: 0,
  },
  {
    number: 2,
    question: "Q2:What is the capital of England?", 
    options: ["Paris", "London", "Berlin", "Madrid"],
    answerIndex: 1,
  },
  {
    number: 3,
    question: "Q3:What is the capital of Germany?", 
    options: ["Paris", "London", "Berlin", "Madrid"],
    answerIndex: 2,
  },
]

export default quizData;