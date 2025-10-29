"use client"

import React, { useState } from "react"
import { Save, PlusCircle, Maximize2, Minimize2 } from "lucide-react"

export default function AdminProblemIDEConfig() {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [questions, setQuestions] = useState([
    {
      id: 1,
      title: "",
      description: "",
      difficulty: "easy",
      input: "",
      output: "",
      evaluationType: "self", // self | ai
    },
  ])

  const handleChange = (index: number, field: string, value: string) => {
    const updated = [...questions]
    ;(updated[index] as any)[field] = value
    setQuestions(updated)
  }

  const addNewQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: questions.length + 1,
        title: "",
        description: "",
        difficulty: "easy",
        input: "",
        output: "",
        evaluationType: "self",
      },
    ])
  }

  const handleSave = () => {
    console.log("🗄️ Data ready to store in DB:", questions)
  }

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen)

  return (
    <div
      className={`flex flex-col ${
        isFullscreen
          ? "fixed inset-0 z-50 bg-white w-screen h-screen rounded-none border-none"
          : "bg-white border border-gray-200 rounded-xl"
      } shadow-sm transition-all duration-300 overflow-hidden`}
    >
      {/* Header */}
      <div className="flex justify-between items-center px-5 py-3 border-b bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-800">
          🧩 Admin Lab Question Builder
        </h2>

        <div className="flex items-center gap-3">
          <button
            onClick={addNewQuestion}
            className="flex items-center gap-2 text-sm px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            <PlusCircle size={16} /> Add Question
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-md hover:bg-gray-200 transition"
            title={isFullscreen ? "Exit Fullscreen" : "Maximize"}
          >
            {isFullscreen ? (
              <Minimize2 size={18} className="text-gray-600" />
            ) : (
              <Maximize2 size={18} className="text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1 overflow-hidden">
        <div className="space-y-6 overflow-y-auto flex-1 pr-2 thin-scrollbar">
          {questions.map((q, index) => (
            <div
              key={q.id}
              className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-gray-700">
                  Question {index + 1}
                </h3>
                <select
                  value={q.difficulty}
                  onChange={(e) =>
                    handleChange(index, "difficulty", e.target.value)
                  }
                  className="border border-gray-300 rounded-md text-sm px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">
                    Title
                  </label>
                  <input
                    type="text"
                    value={q.title}
                    onChange={(e) =>
                      handleChange(index, "title", e.target.value)
                    }
                    placeholder="Enter question title"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">
                    Evaluation Type
                  </label>
                  <select
                    value={q.evaluationType}
                    onChange={(e) =>
                      handleChange(index, "evaluationType", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  >
                    <option value="self">Self Evaluation</option>
                    <option value="ai">AI Evaluation</option>
                  </select>
                </div>
              </div>

              <div className="mt-3">
                <label className="text-xs font-semibold text-gray-600 mb-1 block">
                  Description
                </label>
                <textarea
                  value={q.description}
                  onChange={(e) =>
                    handleChange(index, "description", e.target.value)
                  }
                  placeholder="Describe the question here..."
                  className="w-full h-24 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">
                    Sample Input
                  </label>
                  <input
                    type="text"
                    value={q.input}
                    onChange={(e) =>
                      handleChange(index, "input", e.target.value)
                    }
                    placeholder="e.g. 5 10"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">
                    Expected Output
                  </label>
                  <input
                    type="text"
                    value={q.output}
                    onChange={(e) =>
                      handleChange(index, "output", e.target.value)
                    }
                    placeholder="e.g. 15"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div className="flex justify-end mt-6 border-t pt-4">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white text-sm font-semibold rounded-md hover:bg-green-700 transition"
          >
            <Save size={16} /> Save All Questions
          </button>
        </div>
      </div>
    </div>
  )
}
