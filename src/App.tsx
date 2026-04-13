/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { MathProblem, ViewMode } from "./types";
import { generateMathSolution } from "./services/aiService";
import {
  BookOpen,
  Plus,
  Calendar,
  Lock,
  Unlock,
  ChevronRight,
  GraduationCap,
  UserCog,
  Loader2,
  Trash2,
  ArrowLeft,
  Image as ImageIcon,
  X,
  Star,
  Clock,
  Clipboard,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

interface SubProblemForm {
  id: string;
  content: string;
  imageUrl: string | null;
  difficulty: number;
}

const GRAPH_PROBLEM_IMAGE =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjM2MCIgdmlld0JveD0iMCAwIDYwMCAzNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjYwMCIgaGVpZ2h0PSIzNjAiIGZpbGw9IiNmZmZmZmYiIC8+CiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTAwLCA0MCkiPgogICAgPHBhdGggZD0iTSAyMCAwIEwgNDAgMzUgTCAwIDM1IFoiIGZpbGw9IiNmZmY5YzQiIHN0cm9rZT0iI2ZiYzAyZCIgc3Ryb2tlLXdpZHRoPSIyIiAvPgogICAgPHRleHQgeD0iNTUiIHk9IjI1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5NGEzYjgiPis8L3RleHQ+CiAgICA8cGF0aCBkPSJNIDkwIDAgTCAxMTAgMzUgTCA3MCAzNSBaIiBmaWxsPSIjZmZmOWM0IiBzdHJva2U9IiNmYmMwMmQiIHN0cm9rZS13aWR0aD0iMiIgLz4KICAgIDx0ZXh0IHg9IjEzNSIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk0YTNiOCI+PTwvdGV4dD4KICAgIDxyZWN0IHg9IjE3MCIgeT0iMCIgd2lkdGg9IjM1IiBoZWlnaHQ9IjM1IiByeD0iNiIgZmlsbD0iI2YzZTVmNSIgc3Ryb2tlPSIjOTU3NWNkIiBzdHJva2Utd2lkdGg9IjIiIC8+CiAgICA8dGV4dCB4PSIyMTUiIHk9IjI1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5NGEzYjgiPis8L3RleHQ+CiAgICA8cmVjdCB4PSIyNDAiIHk9IjAiIHdpZHRoPSIzNSIgaGVpZ2h0PSIzNSIgcng9IjYiIGZpbGw9IiNmM2U1ZjUiIHN0cm9rZT0iIzk1NzVjZCIgc3Ryb2tlLXdpZHRoPSIyIiAvPgogICAgPHRleHQgeD0iMjg1IiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSIjOTRhM2I4Ij4rPC90ZXh0PgogICAgPHJlY3QgeD0iMzEwIiB5PSIwIiB3aWR0aD0iMzUiIGhlaWdodD0iMzUiIHJ4PSI2IiBmaWxsPSIjZjNlNWY1IiBzdHJva2U9IiM5NTc1Y2QiIHN0cm9rZS13aWR0aD0iMiIgLz4KICA8L2c+CiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNTAsIDEyMCkiPgogICAgPHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjM1IiBoZWlnaHQ9IjM1IiByeD0iNiIgZmlsbD0iI2YzZTVmNSIgc3Ryb2tlPSIjOTU3NWNkIiBzdHJva2Utd2lkdGg9IjIiIC8+CiAgICA8dGV4dCB4PSI0NSIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk0YTNiOCI+KzwvdGV4dD4KICAgIDxyZWN0IHg9IjcwIiB5PSIwIiB3aWR0aD0iMzUiIGhlaWdodD0iMzUiIHJ4PSI2IiBmaWxsPSIjZjNlNWY1IiBzdHJva2U9IiM5NTc1Y2QiIHN0cm9rZS13aWR0aD0iMiIgLz4KICAgIDx0ZXh0IHg9IjExNSIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk0YTNiOCI+KzwvdGV4dD4KICAgIDxyZWN0IHg9IjE0MCIgeT0iMCIgd2lkdGg9IjM1IiBoZWlnaHQ9IjM1IiByeD0iNiIgZmlsbD0iI2YzZTVmNSIgc3Ryb2tlPSIjOTU3NWNkIiBzdHJva2Utd2lkdGg9IjIiIC8+CiAgICA8dGV4dCB4PSIxODUiIHk9IjI1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5NGEzYjgiPj08L3RleHQ+CiAgICA8Y2lyY2xlIGN4PSIyMzUiIGN5PSIxNy41IiByPSIxNy41IiBmaWxsPSIjZTNmMmZkIiBzdHJva2U9IiM2NGIxZjYiIHN0cm9rZS13aWR0aD0iMiIgLz4KICAgIDx0ZXh0IHg9IjI2NSIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk0YTNiOCI+KzwvdGV4dD4KICAgIDxjaXJjbGUgY3g9IjMwNSIgY3k9IjE3LjUiIHI9IjE3LjUiIGZpbGw9IiNlM2YyZmQiIHN0cm9rZT0iIzY0YjFmNiIgc3Ryb2tlLXdpZHRoPSIyIiAvPgogICAgPHRleHQgeD0iMzM1IiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSIjOTRhM2I4Ij4rPC90ZXh0PgogICAgPHNpcmNsZSBjeD0iMzc1IiBjeT0iMTcuNSIgcj0iMTcuNSIgZmlsbD0iI2UzZjJmZCIgc3Ryb2tlPSIjNjRiMWY2IiBzdHJva2Utd2lkdGg9IjIiIC8+CiAgICA8dGV4dCB4PSI0MDUiIHk9IjI1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5NGEzYjgiPis8L3RleHQ+CiAgICA8Y2lyY2xlIGN4PSI0NDUiIGN5PSIxNy41IiByPSIxNy41IiBmaWxsPSIjZTNmMmZkIiBzdHJva2U9IiM2NGIxZjYiIHN0cm9rZS13aWR0aD0iMiIgLz4KICA8L2c+CiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoODAsIDIyMCkiPgogICAgPHJlY3QgeD0iLTIwIiB5PSItMjAiIHdpZHRoPSI0NjAiIGhlaWdodD0iODAiIHJ4PSIxNSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZTJlOGYwIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1kYXNoYXJyYXk9IjgsNCIgLz4KICAgIDxwYXRoIGQ9Ik0gMjAgMCBMIDQwIDM1IEwgMCAzNSBaIiBmaWxsPSIjZmZmOWM0IiBzdHJva2U9IiNmYmMwMmQiIHN0cm9rZS13aWR0aD0iMiIgLz4KICAgIDx0ZXh0IHg9IjU1IiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSIjOTRhM2I4Ij4rPC90ZXh0PgogICAgPHJlY3QgeD0iOTAiIHk9IjAiIHdpZHRoPSIzNSIgaGVpZ2h0PSIzNSIgcng9IjYiIGZpbGw9IiNmM2U1ZjUiIHN0cm9rZT0iIzk1NzVjZCIgc3Ryb2tlLXdpZHRoPSIyIiAvPgogICAgPHRleHQgeD0iMTM1IiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSIjOTRhM2I4Ij4rPC90ZXh0PgogICAgPGNpcmNsZSBjeD0iMTg1IiBjeT0iMTcuNSIgcj0iMTcuNSIgZmlsbD0iI2UzZjJmZCIgc3Ryb2tlPSIjNjRiMWY2IiBzdHJva2Utd2lkdGg9IjIiIC8+CiAgICA8dGV4dCB4PSIyMTUiIHk9IjI1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5NGEzYjgiPis8L3RleHQ+CiAgICA8Y2lyY2xlIGN4PSIyNTUiIGN5PSIxNy41IiByPSIxNy41IiBmaWxsPSIjZTNmMmZkIiBzdHJva2U9IiM2NGIxZjYiIHN0cm9rZS13aWR0aD0iMiIgLz4KICAgIDx0ZXh0IHg9IjI4NSIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk0YTNiOCI+PTwvdGV4dD4KICAgIDx0ZXh0IHg9IjMzMCIgeT0iMzIiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZvbnQtc2l6ZT0iNDgiIGZpbGw9IiMyNTYzZWIiPjQwMDwvdGV4dD4KICA8L2c+Cjwvc3ZnPg==";

const GEOMETRY_PROBLEM_IMAGE =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTSA0MCA0MCBMIDEwMCA0MCBMIDEwMCA4MCBMIDE2MCA4MCBMIDE2MCAxNjAgTCA0MCAxNjAgWiIgZmlsbD0iI2UwZjJmMSIgc3Ryb2tlPSIjMDA3OTZiIiBzdHJva2Utd2lkdGg9IjIiIC8+PHRleHQgeD0iNzAiIHk9IjM1IiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj4zMCBtPC90ZXh0Pjx0ZXh0IHg9IjM1IiB5PSI2MCIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9ImVuZCI+MTggbTwvdGV4dD48dGV4dCB4PSIzNSIgeT0iMTIwIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0iZW5kIj4zMCBtPC90ZXh0Pjwvc3ZnPg==";

const ANGLE_PROBLEM_IMAGE =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNmZmZmZmYiIC8+CiAgPHBhdGggZD0iTSA1MCAxNDAgTCA2MCAxNDAgTCA2MCAxNTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzY0NzQ4YiIgc3Ryb2tlLXdpZHRoPSIxIiAvPgogIDxsaW5lIHgxPSI1MCIgeTE9IjUwIiB4Mj0iNTAiIHkyPSIyNTAiIHN0cm9rZT0iIzMzNDE1NSIgc3Ryb2tlLXdpZHRoPSIyIiAvPgogIDxsaW5lIHgxPSI1MCIgeTE9IjE1MCIgeDI9IjI1MCIgeTI9IjE1MCIgc3Ryb2tlPSIjMzM0MTU1IiBzdHJva2Utd2lkdGg9IjIiIC8+CiAgPGxpbmUgeDE9IjUwIiB5MT0iNTAiIHgyPSIyNTAiIHkyPSIxNTAiIHN0cm9rZT0iIzMzNDE1NSIgc3Ryb2tlLXdpZHRoPSIyIiAvPgogIDxsaW5lIHgxPSI1MCIgeTE9IjI1MCIgeDI9IjE3MCIgeTI9IjExMCIgc3Ryb2tlPSIjMzM0MTU1IiBzdHJva2Utd2lkdGg9IjIiIC8+CiAgPHRleHQgeD0iNDUiIHk9IjQ1IiBmb250LXNpemU9IjE0IiBmaWxsPSIjMzM0MTU1Ij5BPC90ZXh0PgogIDx0ZXh0IHg9IjM1IiB5PSIxNTUiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiMzMzQxNTUiPkI8L3RleHQ+CiAgPHRleHQgeD0iMjYwIiB5PSIxNTUiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiMzMzQxNTUiPkM8L3RleHQ+CiAgPHRleHQgeD0iNDUiIHk9IjI2NSIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzMzNDE1NSI+RDwvdGV4dD4KICA8dGV4dCB4PSIxNzUiIHk9IjEwNSIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzMzNDE1NSI+RTwvdGV4dD4KICA8dGV4dCB4PSI2MCIgeT0iMjM1IiBmb250LXNpemU9IjEyIiBmaWxsPSIjZWY0NDQ0Ij4xPC90ZXh0PgogIDx0ZXh0IHg9IjIyMCIgeT0iMTQ1IiBmb250LXNpemU9IjEyIiBmaWxsPSIjZWY0NDQ0Ij4yPC90ZXh0PgogIDx0ZXh0IHg9IjE1NSIgeT0iMTI1IiBmb250LXNpemU9IjEyIiBmaWxsPSIjZWY0NDQ0Ij4zPC90ZXh0PgogIDx0ZXh0IHg9IjU1IiB5PSI3NSIgZm9udC1zaXplPSIxMiIgZmlsbD0iI2VmNDQ0NCI+NDwvdGV4dD4KPC9zdmc+";

export default function App() {
  const [problems, setProblems] = useState<MathProblem[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("student");
  const [selectedProblem, setSelectedProblem] = useState<MathProblem | null>(
    null,
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Form state
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [newUnlockTime, setNewUnlockTime] = useState("14:00");
  const [subProblems, setSubProblems] = useState<SubProblemForm[]>([
    { id: crypto.randomUUID(), content: "", imageUrl: null, difficulty: 3 },
  ]);
  const [activeSubProblemId, setActiveSubProblemId] = useState<string>(
    subProblems[0].id,
  );
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Load data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("math_problems");
    let currentProblems: MathProblem[] = [];

    if (saved) {
      currentProblems = JSON.parse(saved);
    }

    // Ensure the seed problems exist
    const seed1Id = "seed-problem-1";
    const seed2Id = "seed-problem-2";
    const seed3Id = "seed-problem-3";
    const seed4Id = "seed-problem-4-v12"; // Incremented version to ensure fresh seed
    const seed5Id = "seed-problem-5-v3"; // New challenge for March 26th
    const seed6Id = "seed-problem-6-v1"; // New challenge for March 30th
    const seed7Id = "seed-problem-7-v1"; // New challenge for April 1st
    const seed8Id = "seed-problem-8-v1"; // New challenge for April 3rd
    const seed9Id = "seed-problem-9-v1"; // New challenge for April 13th

    const hasSeed1 = currentProblems.some(
      (p) => p.id === seed1Id || p.title === "3月18日",
    );
    const hasSeed2 = currentProblems.some(
      (p) => p.id === seed2Id || p.title === "3月19日",
    );
    const hasSeed3 = currentProblems.some(
      (p) => p.id === seed3Id || p.title === "3月20日",
    );
    const hasSeed4 = currentProblems.some(
      (p) => p.id === seed4Id || p.title === "3月25日",
    );
    const hasSeed5 = currentProblems.some(
      (p) => p.id === seed5Id || p.title === "3月26日",
    );
    const hasSeed6 = currentProblems.some(
      (p) => p.id === seed6Id || p.title === "3月30日星际挑战",
    );
    const hasSeed7 = currentProblems.some(
      (p) => p.id === seed7Id || p.title === "4月1日",
    );
    const hasSeed8 = currentProblems.some(
      (p) => p.id === seed8Id || p.title === "4月3日",
    );
    const hasSeed9 = currentProblems.some(
      (p) => p.id === seed9Id || p.title === "4月13日星级挑战",
    );

    let updatedProblems = [...currentProblems];
    let needsUpdate = false;

    if (!hasSeed1) {
      const initialProblem1: MathProblem = {
        id: seed1Id,
        date: "2026-03-18",
        title: "3月18日",
        unlockTime: "14:00",
        createdAt: Date.now(),
        problems: [
          {
            id: "sub-1",
            content: "计算：$99999 - 9999 - 999 - 99 - 9 - 5$",
            difficulty: 3,
            solution: `## 【第一步：审题与分析】\n题目要求计算：$99999 - 9999 - 999 - 99 - 9 - 5$。\n观察减数发现，它们都是由数字“9”组成的，非常接近整十、整百、整千、整万。我们可以利用“凑整法”来简化计算。\n\n## 【第二步：计算推导】\n**方法一：凑整巧算法**\n我们将减数分别看作 $(10000-1)$、$(1000-1)$、$(100-1)$ 和 $(10-1)$：\n原式 $= 99999 - (10000 - 1) - (1000 - 1) - (100 - 1) - (10 - 1) - 5$\n去括号（注意减法括号前是减号，括号内要变号）：\n$= 99999 - 10000 + 1 - 1000 + 1 - 100 + 1 - 10 + 1 - 5$\n$= 89999 - 1000 - 100 - 10 + 4 - 5$\n$= 88889 + 4 - 5$\n$= 88888$\n\n**方法二：逐级相减法**\n$99999 - 9999 = 90000$\n$90000 - 999 = 89001$\n$89001 - 99 = 88902$\n$88902 - 9 = 88893$\n$88893 - 5 = 88888$\n\n## 【第三步：总结】\n最终计算结果为 **88888**。\n在巧算过程中，最关键的是去括号时的符号处理，即“减去一个差等于减去被减数加上减数”。`,
          },
        ],
      };
      updatedProblems.push(initialProblem1);
      needsUpdate = true;
    }

    if (!hasSeed2) {
      const initialProblem2: MathProblem = {
        id: seed2Id,
        date: "2026-03-19",
        title: "3月19日",
        unlockTime: "14:00",
        createdAt: Date.now() + 1000,
        problems: [
          {
            id: "sub-2",
            content: `在 $\\bigcirc$ 里填上适当的运算符号，使等号两边相等：\n1. $3 \\bigcirc 3 \\bigcirc 3 \\bigcirc 3 = 1$\n2. $3 \\bigcirc 3 \\bigcirc 3 \\bigcirc 3 = 2$\n3. $3 \\bigcirc 3 \\bigcirc 3 \\bigcirc 3 = 3$\n4. $3 \\bigcirc 3 \\bigcirc 3 \\bigcirc 3 = 7$\n5. $3 \\bigcirc 3 \\bigcirc 3 \\bigcirc 3 = 8$\n6. $3 \\bigcirc 3 \\bigcirc 3 \\bigcirc 3 = 9$`,
            difficulty: 1,
            solution: `## 【参考答案】\n1. $(3 + 3) \\div (3 + 3) = 1$ 或 $3 \\div 3 + 3 - 3 = 1$\n2. $3 \\div 3 + 3 \\div 3 = 2$\n3. $(3 + 3 + 3) \\div 3 = 3$\n4. $3 + 3 + 3 \\div 3 = 7$\n5. $3 \\times 3 - 3 \\div 3 = 8$\n6. $3 \\times 3 + 3 - 3 = 9$\n\n## 【技巧总结】\n- 看到结果较小时，多考虑除法和减法。\n- 看到结果接近某个数的倍数时，考虑乘法。\n- 灵活运用括号改变运算顺序。`,
          },
        ],
      };
      updatedProblems.push(initialProblem2);
      needsUpdate = true;
    }

    if (!hasSeed3) {
      const initialProblem3: MathProblem = {
        id: seed3Id,
        date: "2026-03-20",
        title: "3月20日",
        unlockTime: "14:00",
        createdAt: Date.now() + 2000,
        problems: [
          {
            id: "sub-3",
            content: `如图，四张卡片上各有一个数，这四个数的乘积末尾有 6 个 0，那么第一张卡片上的数最小是多少？\n\n| ? | 25 | 125 | 80 |`,
            difficulty: 3,
            solution: `## 【第一步：审题与分析】\n题目要求四个数的乘积末尾有 6 个 0。\n在四年级下册，我们学习了乘法结合律 and 一些“好朋友数”：\n- $25 \\times 4 = 100$（末尾有 2 个 0）\n- $125 \\times 8 = 1000$（末尾有 3 个 0）\n\n我们可以利用这些知识，先算出已知三张卡片的乘积末尾有多少个 0。\n\n## 【第二步：计算已知卡片的乘积】\n已知卡片是：25、125、80。\n我们把 80 拆开看：$80 = 8 \\times 10$。\n利用乘法交换律和结合律：\n$25 \\times 125 \\times 80$\n$= 25 \\times 125 \\times 8 \\times 10$\n$= 25 \\times (125 \\times 8) \\times 10$\n$= 25 \\times 1000 \\times 10$\n$= 250000$\n\n我们发现，这三张卡片的乘积是 **250000**，末尾已经有 **4 个 0** 了。\n\n## 【第三步：推理与计算】\n目标是末尾有 **6 个 0**，现在已经有 4 个了，还差 **2 个 0**。\n也就是说，第一张卡片上的数与 250000 相乘，需要再产生 2 个 0。\n\n观察 250000，我们可以把它看作 $25 \\times 10000$。\n要让乘积再多出 2 个 0，其实就是看 $25 \\times ?$ 什么时候末尾会出现两个 0。\n根据“好朋友数”：$25 \\times 4 = 100$。\n\n所以，$250000 \\times 4 = 1000000$（正好 6 个 0）。\n\n## 【结论】\n第一张卡片上的数最小是 **4**。\n\n---\n**技巧总结**：\n利用乘法结合律，找 25 和 4、125 和 8 这样的“好朋友”，可以快速判断乘积末尾 0 的个数。`,
          },
        ],
      };
      updatedProblems.push(initialProblem3);
      needsUpdate = true;
    }

    if (!hasSeed4) {
      const initialProblem4: MathProblem = {
        id: seed4Id,
        date: "2026-03-25",
        title: "3月25日",
        unlockTime: "14:00",
        createdAt: Date.now() + 3000,
        problems: [
          {
            id: "sub-4-1",
            content:
              "乐乐在计算 $\\triangle + 5 \\times 8$ 时，先算了 $\\triangle + 5$，最后算的乘法。他得到的结果比正确结果多了 42，正确的结果是 ( )。",
            difficulty: 3,
            solution: `## 【第一步：审题与分析】\n题目描述了乐乐在计算时改变了运算顺序。\n- 正确的运算顺序：先算乘法，再算加法。\n- 乐乐的运算顺序：先算加法，再算乘法。\n\n## 【第二步：列式推导】\n1. **乐乐的计算过程**：\n   先算 $\\triangle + 5$，再乘 8，即：$(\\triangle + 5) \\times 8$。\n   利用乘法分配律展开：$8 \\times \\triangle + 40$。\n\n2. **正确的计算过程**：\n   先算 $5 \\times 8 = 40$，再加 $\\triangle$，即：$\\triangle + 40$。\n\n3. **比较两个结果**：\n   乐乐的结果 - 正确的结果 = 42\n   $(8 \\times \\triangle + 40) - (\\triangle + 40) = 42$\n   $7 \\times \\triangle = 42$\n   $\\triangle = 6$\n\n## 【第三步：求正确结果】\n将 $\\triangle = 6$ 代入正确的算式中：\n$6 + 5 \\times 8 = 6 + 40 = 46$\n\n## 【结论】\n正确的结果是 **46**。`,
          },
          {
            id: "sub-4-2",
            content: `5. 新素养 几何直观 春风拂新意，赏荷正当时。下面是一块荷塘地的示意图，小红想要计算这块地的面积，她认为可以这样计算：$30 \\times (18 + 42) = 30 \\times 60 = 1800 (m^2)$。她的想法对吗？请说明理由。`,
            imageUrl: GEOMETRY_PROBLEM_IMAGE,
            difficulty: 3,
            solution: `## 【第一步：观察图形】\n示意图显示这块地可以看作是一个大长方形减去一个小长方形，或者两个小长方形的组合。\n\n## 【第二步：分析小红的计算】\n小红的算式是 $30 \\times (18 + 42)$。\n这里 $18 + 42 = 60$。\n如果这块地正好是一个长 60m、宽 30m 的长方形，那么面积就是 1800 平方米。\n\n## 【第三步：验证与结论】\n观察示意图中的数据，小红的想法是**正确**的。\n利用乘法分配律：$30 \\times 18 + 30 \\times 42 = 30 \\times (18 + 42)$。\n这代表了将图形拆分为两个长方形（$30 \\times 18$ 和 $30 \\times 42$）后的面积总和。`,
          },
        ],
      };
      updatedProblems.push(initialProblem4);
      needsUpdate = true;
    }

    if (!hasSeed5) {
      const initialProblem5: MathProblem = {
        id: seed5Id,
        date: "2026-03-26",
        title: "3月26日",
        unlockTime: "14:00",
        createdAt: Date.now() + 4000,
        problems: [
          {
            id: "sub-5-1",
            content: "观察下面的图形等式，求出三角形、正方形和圆圈各代表多少？",
            imageUrl: GRAPH_PROBLEM_IMAGE,
            difficulty: 3,
            solution: `## 【第一步：观察图形关系】\n根据题目给出的图示，我们可以列出以下三个等式：\n1.  两个三角形 = 三个正方形 ($\\triangle + \\triangle = \\square + \\square + \\square$)\n2.  三个正方形 = 四个圆圈 ($\\square + \\square + \\square = \\bigcirc + \\bigcirc + \\bigcirc + \\bigcirc$)\n3.  一个三角形 + 一个正方形 + 两个圆圈 = 400 ($\\triangle + \\square + \\bigcirc + \\bigcirc = 400$)\n\n## 【第二步：等量代换分析】\n我们要想办法把第三个等式里的图形都换成同一种，这样就能算出结果了。\n\n1.  **观察等式 1 和 2**：\n    我们发现“三个正方形”是一个桥梁。\n    因为 $2 \\times \\triangle = 3 \\times \\square$ 且 $3 \\times \\square = 4 \\times \\bigcirc$，\n    所以我们可以得出：**两个三角形 = 四个圆圈**。\n    进一步简化：**一个三角形 = 两个圆圈** ($\\triangle = \\bigcirc + \\bigcirc$)。\n\n2.  **代换到第三个等式**：\n    原式：$\\triangle + \\square + (\\bigcirc + \\bigcirc) = 400$\n    把 $(\\bigcirc + \\bigcirc)$ 换成 $\\triangle$：\n    $\\triangle + \\square + \\triangle = 400$\n    也就是：**两个三角形 + 一个正方形 = 400**。\n\n3.  **再次利用等式 1**：\n    我们知道 **两个三角形 = 三个正方形**。\n    把“两个三角形”换成“三个正方形”：\n    $(3 \\times \\square) + \\square = 400$\n    也就是：**四个正方形 = 400**。\n\n## 【第三步：计算结果】\n1.  **求正方形**：\n    $400 \\div 4 = 100$\n    所以，**正方形 = 100**。\n\n2.  **求三角形**：\n    两个三角形 = 三个正方形 = $3 \\times 100 = 300$\n    一个三角形 = $300 \\div 2 = 150$\n    所以，**三角形 = 150**。\n\n3.  **求圆圈**：\n    一个三角形 = 两个圆圈\n    $150 = 2 \\times \\bigcirc$\n    一个圆圈 = $150 \\div 2 = 75$\n    所以，**圆圈 = 75**。\n\n## 【结论】\n- 三角形代表 **150**\n- 正方形代表 **100**\n- 圆圈代表 **75**`,
          },
        ],
      };
      updatedProblems.push(initialProblem5);
      needsUpdate = true;
    }

    if (!hasSeed6) {
      const initialProblem6: MathProblem = {
        id: seed6Id,
        date: "2026-03-30",
        title: "3月30日",
        unlockTime: "14:00",
        createdAt: Date.now() + 5000,
        problems: [
          {
            id: "sub-6-1",
            content:
              "如果三角形的两条边的长分别是 5 厘米 and 7 厘米，那么第三条边的长可能是 ( )。",
            difficulty: 3,
            solution: `## 【第一步：审题与分析】\n题目给出了三角形的两条边长，要求我们判断第三条边可能的长度。\n这考察了三角形的一个重要性质：**三角形任意两边之和大于第三边，任意两边之差小于第三边**。\n\n## 【第二步：列式计算范围】\n设第三条边的长度为 $x$ 厘米。\n根据三角形三边关系：\n1.  两边之差：$7 - 5 = 2$ (厘米)\n2.  两边之和：$7 + 5 = 12$ (厘米)\n\n所以，第三条边的长度 $x$ 必须满足：\n**$2 < x < 12$**\n\n## 【第三步：总结结论】\n只要是大于 2 厘米且小于 12 厘米的长度，都有可能是第三条边的长。\n例如：3 厘米、4 厘米、5 厘米、...、11 厘米（如果是整数的话）。\n\n## 【结论】\n第三条边的长可能是 **大于 2 厘米且小于 12 厘米** 的任意长度。`,
          },
        ],
      };
      updatedProblems.push(initialProblem6);
      needsUpdate = true;
    }

    if (!hasSeed7) {
      const initialProblem7: MathProblem = {
        id: seed7Id,
        date: "2026-04-01",
        title: "4月1日",
        unlockTime: "14:00",
        createdAt: Date.now() + 6000,
        problems: [
          {
            id: "sub-7-1",
            content:
              "王大伯打算用三段篱笆围一块三角形的菜地（三角形菜地的三条边的长度都是整米数），现在有长 4 米、7 米的两段篱笆，第三段篱笆最长是多少米？最短是多少米？",
            difficulty: 3,
            solution: `## 【第一步：审题与分析】\n题目要求我们求出三角形第三条边的最大和最小整数长度。\n已知两边长度分别为 4 米和 7 米。\n这考察了三角形的一个重要性质：**三角形任意两边之和大于第三边，任意两边之差小于第三边**。\n\n## 【第二步：列式计算范围】\n设第三条边的长度为 $x$ 米。\n根据三角形三边关系：\n1.  两边之差：$7 - 4 = 3$ (米)\n2.  两边之和：$7 + 4 = 11$ (米)\n\n所以，第三条边的长度 $x$ 必须满足：\n**$3 < x < 11$**\n\n## 【第三步：确定整数范围】\n题目中提到“三条边的长度都是整米数”，因此 $x$ 只能取 3 到 11 之间的整数。\n可能的长度有：4, 5, 6, 7, 8, 9, 10。\n\n- 最大长度是 **10** 米。\n- 最小长度是 **4** 米。\n\n## 【结论】\n第三段篱笆最长是 **10** 米，最短是 **4** 米。`,
          },
        ],
      };
      updatedProblems.push(initialProblem7);
      needsUpdate = true;
    }

    if (!hasSeed8) {
      const initialProblem8: MathProblem = {
        id: seed8Id,
        date: "2026-04-03",
        title: "4月3日",
        unlockTime: "14:00",
        createdAt: Date.now() + 7000,
        problems: [
          {
            id: "sub-8-1",
            content:
              "如图，在 $\\triangle ABC$ 中，$\\angle ABC = 90^\\circ$，点 $D$ 在 $AB$ 的延长线上，点 $E$ 在 $AC$ 上。已知 $\\angle 1 = 15^\\circ$，$\\angle 2 = 25^\\circ$，求 $\\angle 3$ 的度数。",
            imageUrl: ANGLE_PROBLEM_IMAGE,
            difficulty: 4,
            solution: `## 【第一步：分析图形关系】\n观察图形可知：\n1.  在直角三角形 $ABC$ 中，$\\angle ABC = 90^\\circ$。\n2.  $\\angle 2$ 是 $\\angle ACB$，已知 $\\angle 2 = 25^\\circ$。\n3.  $\\angle 4$ 是 $\\angle BAC$。\n4.  $\\angle 3$ 是 $\\triangle ADE$ 的一个内角，$\\angle 1$ 是 $\\angle ADE$。\n\n## 【第二步：计算 $\\angle 4$ 的度数】\n在直角三角形 $ABC$ 中，利用三角形内角和定理：\n$\\angle 4 = 180^\\circ - \\angle ABC - \\angle 2$\n$\\angle 4 = 180^\\circ - 90^\\circ - 25^\\circ = 65^\\circ$\n\n## 【第三步：计算 $\\angle 3$ 的度数】\n在 $\\triangle ADE$ 中，已知：\n- $\\angle 1 = 15^\\circ$\n- $\\angle 4 = 65^\\circ$\n\n利用三角形内角和定理：\n$\\angle 3 = 180^\\circ - \\angle 1 - \\angle 4$\n$\\angle 3 = 180^\\circ - 15^\\circ - 65^\\circ = 100^\\circ$\n\n## 【结论】\n$\\angle 3$ 的度数是 **$100^\\circ$**。`,
          },
        ],
      };
      updatedProblems.push(initialProblem8);
      needsUpdate = true;
    }

    if (!hasSeed9) {
      const initialProblem9: MathProblem = {
        id: seed9Id,
        date: "2026-04-13",
        title: "4月13日星级挑战",
        unlockTime: "14:00",
        createdAt: Date.now() + 8000,
        problems: [
          {
            id: "sub-9-1",
            content:
              "小马虎在读一个小数时，漏看了小数点，结果读成了六万五千零四。原来的小数能读出两个零，原来的小数是多少？",
            difficulty: 2,
            solution: `## 【第一步：分析错误结果】\n小马虎读成的数是“六万五千零四”，写成数字是 **65004**。\n这意味着原来的小数去掉小数点后，数字排列顺序是 6、5、0、0、4。\n\n## 【第二步：寻找小数点的位置】\n我们要在这个数字序列中尝试放入小数点，使得读出来的小数包含“两个零”。\n\n1.  **如果小数点在 6500 后面**：6500.4\n    读作：六千五百点四（没有零）。\n\n2.  **如果小数点在 650 后面**：650.04\n    读作：六百五十点零四（读出一个零）。\n\n3.  **如果小数点在 65 后面**：65.004\n    读作：六十五点零零四（**读出两个零**）。\n\n4.  **如果小数点在 6 后面**：6.5004\n    读作：六点五零零四（**读出两个零**）。\n\n5.  **如果小数点在最前面**：0.65004\n    读作：零点六五零零四（读出三个零）。\n\n## 【第三步：总结结论】\n根据题目要求“能读出两个零”，符合条件的小数有 **65.004** 或 **6.5004**。\n在常规的小学数学题目中，通常指其中一个，我们可以给出这两个可能的答案。\n\n## 【结论】\n原来的小数是 **65.004** 或 **6.5004**。`,
          },
        ],
      };
      updatedProblems.push(initialProblem9);
      needsUpdate = true;
    }

    if (needsUpdate) {
      // Sort by date descending
      updatedProblems.sort((a, b) => b.date.localeCompare(a.date));
      localStorage.setItem("math_problems", JSON.stringify(updatedProblems));
      setProblems(updatedProblems);
    } else {
      setProblems(currentProblems);
    }

    // Update time every minute
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem("math_problems", JSON.stringify(problems));
  }, [problems]);

  // Handle paste from clipboard
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (viewMode !== "teacher") return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (event) => {
              updateSubProblem(activeSubProblemId, {
                imageUrl: event.target?.result as string,
              });
            };
            reader.readAsDataURL(blob);
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [viewMode, activeSubProblemId]);

  const isUnlocked = (problem: MathProblem) => {
    const now = currentTime;
    const todayStr = now.toISOString().split("T")[0];

    // If it's a past date, it's unlocked
    if (problem.date < todayStr) return true;

    // If it's today, check the specific unlock time
    if (problem.date === todayStr) {
      const [hours, minutes] = problem.unlockTime.split(":").map(Number);
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();

      if (currentHours > hours) return true;
      if (currentHours === hours && currentMinutes >= minutes) return true;
    }

    // Future dates are locked
    return false;
  };

  const updateSubProblem = (id: string, updates: Partial<SubProblemForm>) => {
    setSubProblems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    );
  };

  const addSubProblemField = () => {
    const newId = crypto.randomUUID();
    setSubProblems([
      ...subProblems,
      { id: newId, content: "", imageUrl: null, difficulty: 3 },
    ]);
    setActiveSubProblemId(newId);
  };

  const removeSubProblemField = (id: string) => {
    if (subProblems.length <= 1) return;
    const filtered = subProblems.filter((p) => p.id !== id);
    setSubProblems(filtered);
    if (activeSubProblemId === id) {
      setActiveSubProblemId(filtered[filtered.length - 1].id);
    }
  };

  const handleImageChange = (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateSubProblem(id, { imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProblem = async () => {
    if (!newTitle || subProblems.some((p) => !p.content && !p.imageUrl)) {
      alert("请填写完整的题目信息（标题及每道题的内容或图片）");
      return;
    }

    setIsGenerating(true);
    try {
      const processedProblems = await Promise.all(
        subProblems.map(async (p) => {
          const solution = await generateMathSolution(
            p.content,
            p.imageUrl || undefined,
          );
          return {
            id: p.id,
            content: p.content,
            imageUrl: p.imageUrl || undefined,
            solution,
            difficulty: p.difficulty,
          };
        }),
      );

      const newChallenge: MathProblem = {
        id: crypto.randomUUID(),
        date: newDate,
        title: newTitle,
        problems: processedProblems,
        unlockTime: newUnlockTime,
        createdAt: Date.now(),
      };

      setProblems([newChallenge, ...problems]);

      // Reset form
      setNewTitle("");
      setSubProblems([
        { id: crypto.randomUUID(), content: "", imageUrl: null, difficulty: 3 },
      ]);
      setActiveSubProblemId(subProblems[0].id);
    } catch (error: any) {
      console.error("Error generating solution:", error);
      const errorMessage = error.message?.includes("API Key")
        ? "未检测到 API Key。请点击左侧“设置”菜单，在 Secrets 中配置 DASHSCOPE_API_KEY。"
        : "生成解答失败，请检查网络或 API 配置。";
      alert(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteProblem = (id: string) => {
    setProblems(problems.filter((p) => p.id !== id));
    setDeleteConfirmId(null);
  };

  const renderStars = (count: number, size = 16) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={
              star <= count ? "fill-amber-400 text-amber-400" : "text-slate-200"
            }
          />
        ))}
      </div>
    );
  };

  const activeSubProblem =
    subProblems.find((p) => p.id === activeSubProblemId) || subProblems[0];

  return (
    <div className="min-h-screen font-sans">
      {/* Custom Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-sm w-full shadow-xl"
            >
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                确定删除？
              </h3>
              <p className="text-slate-500 mb-6">
                此操作不可撤销，该挑战及其包含的所有题目将被永久移除。
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-all"
                >
                  取消
                </button>
                <button
                  onClick={() => deleteProblem(deleteConfirmId)}
                  className="flex-1 px-4 py-2 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-all"
                >
                  确定删除
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <BookOpen size={24} />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              数学星级挑战
            </h1>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => {
                setViewMode("student");
                setSelectedProblem(null);
              }}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === "student" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              <GraduationCap size={16} />
              学生端
            </button>
            <button
              onClick={() => {
                setViewMode("teacher");
                setSelectedProblem(null);
              }}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === "teacher" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              <UserCog size={16} />
              教师端
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {selectedProblem ? (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <button
                onClick={() => setSelectedProblem(null)}
                className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-4"
              >
                <ArrowLeft size={20} />
                返回列表
              </button>

              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3 text-slate-400 text-sm">
                    <Calendar size={16} />
                    <span>{selectedProblem.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Layers size={16} />
                    <span>共 {selectedProblem.problems.length} 题</span>
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-8">
                  {selectedProblem.title}
                </h2>

                <div className="space-y-8">
                  {selectedProblem.problems.map((prob, index) => (
                    <div
                      key={prob.id}
                      className="relative pl-8 border-l-2 border-slate-100 pb-2"
                    >
                      <div className="absolute -left-[11px] top-0 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                        {index + 1}
                      </div>

                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold text-slate-800">
                            题目 {index + 1}
                          </h3>
                          {renderStars(prob.difficulty, 16)}
                        </div>

                        {prob.imageUrl && (
                          <div className="mb-4 rounded-xl overflow-hidden border border-slate-100 shadow-sm max-w-xs">
                            <img
                              src={prob.imageUrl}
                              alt={`题目 ${index + 1} 图片`}
                              className="w-full h-auto object-contain"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}

                        <div className="prose prose-slate prose-lg max-w-none mb-4">
                          <ReactMarkdown
                            remarkPlugins={[remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                          >
                            {prob.content}
                          </ReactMarkdown>
                        </div>
                      </div>

                      <div className="pt-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-bold text-slate-600 flex items-center gap-2">
                            {isUnlocked(selectedProblem) ||
                            viewMode === "teacher" ? (
                              <Unlock className="text-green-500" size={16} />
                            ) : (
                              <Lock className="text-amber-500" size={16} />
                            )}
                            本题解析
                          </h4>
                          {!(
                            isUnlocked(selectedProblem) ||
                            viewMode === "teacher"
                          ) &&
                            index === 0 && (
                              <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Clock size={10} />
                                {selectedProblem.unlockTime} 解锁
                              </span>
                            )}
                        </div>

                        {isUnlocked(selectedProblem) ||
                        viewMode === "teacher" ? (
                          <div className="markdown-body bg-slate-50 rounded-xl p-6 border border-slate-200">
                            <ReactMarkdown
                              remarkPlugins={[remarkMath]}
                              rehypePlugins={[rehypeKatex]}
                            >
                              {prob.solution || ""}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <div className="bg-slate-50 rounded-xl p-8 flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-300">
                            <Lock size={32} className="mb-2 opacity-20" />
                            <p className="text-xs">解析尚未解锁</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : viewMode === "teacher" ? (
            <motion.div
              key="teacher"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Add Problem Form */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Plus size={20} className="text-blue-600" />
                  录入新挑战
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">
                      挑战日期
                    </label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">
                      挑战标题
                    </label>
                    <input
                      type="text"
                      placeholder="例如：勾股定理专题挑战"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">
                      解析统一公布时间
                    </label>
                    <div className="relative">
                      <Clock
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        size={18}
                      />
                      <input
                        type="time"
                        value={newUnlockTime}
                        onChange={(e) => setNewUnlockTime(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Layers size={18} className="text-blue-600" />
                      题目列表 ({subProblems.length})
                    </label>
                    <button
                      onClick={addSubProblemField}
                      className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-all flex items-center gap-1"
                    >
                      <Plus size={14} />
                      增加题目
                    </button>
                  </div>

                  <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                    {subProblems.map((p, index) => (
                      <button
                        key={p.id}
                        onClick={() => setActiveSubProblemId(p.id)}
                        className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeSubProblemId === p.id ? "bg-blue-600 text-white shadow-md" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                      >
                        题目 {index + 1}
                        {p.content || p.imageUrl ? (
                          <CheckCircle2
                            size={14}
                            className={
                              activeSubProblemId === p.id
                                ? "text-blue-200"
                                : "text-green-500"
                            }
                          />
                        ) : null}
                      </button>
                    ))}
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-slate-800">
                        编辑题目{" "}
                        {subProblems.findIndex(
                          (p) => p.id === activeSubProblemId,
                        ) + 1}
                      </h3>
                      <button
                        onClick={() =>
                          removeSubProblemField(activeSubProblemId)
                        }
                        disabled={subProblems.length <= 1}
                        className="text-red-500 hover:text-red-700 disabled:opacity-30 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                          本题难度
                        </label>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() =>
                                updateSubProblem(activeSubProblemId, {
                                  difficulty: star,
                                })
                              }
                              className="p-1 hover:scale-110 transition-transform"
                            >
                              <Star
                                size={24}
                                className={
                                  star <= activeSubProblem.difficulty
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-slate-300"
                                }
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1 flex items-center gap-2">
                          拍照或粘贴截图 (可选)
                          <span className="text-[10px] font-normal text-slate-400 bg-white px-1.5 py-0.5 rounded">
                            支持 Ctrl+V
                          </span>
                        </label>
                        <div className="flex items-center gap-4">
                          <label className="flex-1 flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-400 hover:bg-white transition-all cursor-pointer">
                            <div className="flex gap-2">
                              <ImageIcon size={20} className="text-slate-400" />
                              <Clipboard size={20} className="text-slate-400" />
                            </div>
                            <span className="text-xs text-slate-500">
                              点击上传、拍摄或粘贴
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              onChange={(e) =>
                                handleImageChange(activeSubProblemId, e)
                              }
                              className="hidden"
                            />
                          </label>
                          {activeSubProblem.imageUrl && (
                            <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-300 bg-white">
                              <img
                                src={activeSubProblem.imageUrl}
                                alt="预览"
                                className="w-full h-full object-cover"
                              />
                              <button
                                onClick={() =>
                                  updateSubProblem(activeSubProblemId, {
                                    imageUrl: null,
                                  })
                                }
                                className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all"
                              >
                                <X size={10} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                          题目文字内容
                        </label>
                        <textarea
                          rows={3}
                          placeholder="请输入题目详细内容..."
                          value={activeSubProblem.content}
                          onChange={(e) =>
                            updateSubProblem(activeSubProblemId, {
                              content: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleAddProblem}
                  disabled={
                    isGenerating ||
                    !newTitle ||
                    subProblems.some((p) => !p.content && !p.imageUrl)
                  }
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      AI 正在为 {subProblems.length} 道题生成精美解析...
                    </>
                  ) : (
                    <>
                      <Plus size={20} />
                      发布挑战 ({subProblems.length} 道题目)
                    </>
                  )}
                </button>
              </div>

              {/* Problem List for Teacher */}
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-700">
                  已发布的挑战 ({problems.length})
                </h2>
                {problems.map((problem) => (
                  <div
                    key={problem.id}
                    className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-lg flex flex-col items-center justify-center text-slate-500">
                        <span className="text-[10px] font-bold uppercase">
                          {problem.date.split("-")[1]}月
                        </span>
                        <span className="text-lg font-bold leading-none">
                          {problem.date.split("-")[2]}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-800">
                            {problem.title}
                          </h3>
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                            {problem.problems.length} 题
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          公布时间: {problem.unlockTime}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedProblem(problem)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <ChevronRight size={20} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(problem.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="student"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl mb-10">
                <h2 className="text-3xl font-bold mb-2">欢迎来到数学星空！</h2>
                <p className="opacity-80">
                  每日一练，点亮你的智慧星级。请留意每道题的解析解锁时间。
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {problems.length === 0 ? (
                  <div className="text-center py-20 text-slate-400">
                    <Calendar size={48} className="mx-auto mb-4 opacity-20" />
                    <p>暂无挑战题目，请联系老师发布。</p>
                  </div>
                ) : (
                  problems.map((problem) => (
                    <button
                      key={problem.id}
                      onClick={() => setSelectedProblem(problem)}
                      className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-left flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex flex-col items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                          <span className="text-[10px] font-bold uppercase">
                            {problem.date.split("-")[1]}月
                          </span>
                          <span className="text-xl font-bold leading-none">
                            {problem.date.split("-")[2]}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold text-slate-800">
                              {problem.title}
                            </h3>
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                              {problem.problems.length} 题
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <Calendar size={12} />
                              {problem.date}
                            </span>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <Clock size={12} />
                              {problem.unlockTime}
                            </span>
                            {isUnlocked(problem) ? (
                              <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded uppercase tracking-wider">
                                已解锁
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase tracking-wider">
                                锁定中
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                        <ChevronRight size={20} />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="max-w-4xl mx-auto px-4 py-12 text-center text-slate-400 text-sm">
        <p>© 2026 数学星级挑战系统 · 助力每一位学子</p>
      </footer>
    </div>
  );
}
