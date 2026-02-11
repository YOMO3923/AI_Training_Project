import { useState } from "react";
import quizData from "../data/questions";

export const useQuiz = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const totalQuestions = quizData.length;

  const currentQuestion = quizData[currentIndex];

  const isLastQuestion = currentIndex === totalQuestions - 1;

  const isFinished = currentIndex >= totalQuestions;
  
  const handleSelectionOption = (optionIndex: number) => {
    setSelectedOptionIndex(optionIndex);
  }

  const handleConfirmAnswer = () => {
    if(selectedOptionIndex === null) return;

    if(selectedOptionIndex === currentQuestion.answerIndex) {
      setScore((prev) => prev + 1);
    }
    setCurrentIndex((prev) => prev + 1);
    setSelectedOptionIndex(null);
  }  
  const resetQuiz = () => {
    setCurrentIndex(0);
    setScore(0);
    setSelectedOptionIndex(null);
  }


  return {
    currentIndex,
    score,
    selectedOptionIndex,
    totalQuestions,
    currentQuestion,
    isLastQuestion,
    isFinished,
    handleSelectionOption,
    handleConfirmAnswer,
    resetQuiz,
  };
}

