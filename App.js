import { useState, useEffect, useRef } from "react";

const SUBJECTS = [
  { id: "math",    label: "Mathematics",  icon: "📐", color: "#F59E0B" },
  { id: "science", label: "Science",      icon: "🔬", color: "#10B981" },
  { id: "english", label: "English",      icon: "📖", color: "#3B82F6" },
  { id: "arabic",  label: "Arabic عربي",  icon: "✍️", color: "#EC4899" },
];

const GRADES = ["Grade 4","Grade 5","Grade 6","Grade 7","Grade 8","Grade 9"];

const MOUTHS = {
  idle:     "M 35 55 Q 50 60 65 55",
  talking:  "M 35 52 Q 50 65 65 52",
  thinking: "M 38 57 Q 50 55 62 57",
  happy:    "M 33 52 Q 50 68 67 52",
};

function Avatar({ state, color }) {
  const [blink, setBlink] = useState(false);
  useEffect(() => {
    const id = setInterval(() => {
      setBlink(true);
      setTimeout(() =>
