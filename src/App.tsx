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
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNmZmZmZmYiIC8+CiAgPHBhdGggZD0iTSA1MCAxNDAgTCA2MCAxNDAgTCA2MCAxNTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzY0NzQ4YiIgc3Ryb2tlLXdpZHRoPSIxIiAvPgogIDxsaW5lIHgxPSI1MCIgeTE9IjUwIiB4Mj0iNTAiIHkyPSIyNTAiIHN0cm9rZT0iIzMzNDE1NSIgc3Ryb2tlLXdpZHRoPSIyIiAvPgogIDxsaW5lIHgxPSI1MCIgeTE9IjE1MCIgeDI9IjI1MCIgeTI9IjE1MCIgc3Ryb2tlPSIjMzM0MTU1IiBzdHJva2Utd2lkdGg9IjIiIC8+CiAgPGxpbmUgeDE9IjUwIiB5MT0iNTAiIHgyPSIyNTAiIHkyPSIxNTAiIHN0cm9rZT0iIzMzNDE1NSIgc3Ryb2tlLXdpZHRoPSIyIiAvPgogIDxsaW5lIHgxPSI1MCIgeTE9IjI1MCIgeDI9IjE3MCIgeTI9IjExMCIgc3Ryb2tlPSIjMzM0MTU1IiBzdHJva2Utd2lkdGg9IjIiIC8+CiAgPHRleHQgeD0iNDUiIHk9IjQ1IiBmb250LXNpemU9IjE0IiBmaWxsPSIjMzM0MTU1Ij5BPC90ZXh0PgogIDx0ZXh0IHg9IjM1IiB5PSIxNTUiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiMzMzQxNTUiPkI8L3RleHQ+CiAgPHRleHQgeD0iMjYwIiB5PSIxNTUiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiMzMzQxNTUiPkM8L3RleHQ+CiAgPHRleHQgeD0iNDUiIHk9IjI2NSIgZm9udC1zaXplPSIxCIgZmlsbD0iIzMzNDE1NSI+RDwvdGV4dD4KICA8dGV4dCB4PSIxNzUiIHk9IjEwNSIgZm9udC1zaXplPSIxCIgZmlsbD0iIzMzNDE1NSI+RTwvdGV4dD4KICA8dGV4dCB4PSI2MCIgeT0iMjM1IiBmb250LXNpemU9IjEyIiBmaWxsPSIjZWY0NDQ0Ij4xPC90ZXh0PgogIDx0ZXh0IHg9IjIyMCIgeT0iMTQ1IiBmb250LXNpemU9IjEyIiBmaWxsPSIjZWY0NDQ0Ij4yPC90ZXh0PgogIDx0ZXh0IHg9IjE1NSIgeT0iMTI1IiBmb250LXNpemU9IjEyIiBmaWxsPSIjZWY0NDQ0Ij4zPC90ZXh0PgogIDx0ZXh0IHg9IjU1IiB5PSI3NSIgZm9udC1zaXplPSIxMiIgZmlsbD0iI2VmNDQ0NCI+NDwvdGV4dD4KPC9zdmc+";

const AXISYMMETRIC_3X3_IMAGE =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUyIiBoZWlnaHQ9IjE1MiIgdmlld0JveD0iMCAwIDE1MiAxNTIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMSwgMSkiPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgZmlsbD0iIzNiODJmNiIgc3Ryb2tlPSIjMWUzYThhIiBzdHJva2Utd2lkdGg9IjIiIHJ4PSI0IiAvPjxyZWN0IHg9IjUwIiB5PSIwIiB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNmZmZmZmYiIHN0cm9rZT0iI2NiZDVlMSIgc3Ryb2tlLXdpZHRoPSIyIiByeD0iNCIgLz48cmVjdCB4PSIxMDAiIHk9IjAiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgZmlsbD0iI2ZmZmZmZiIgc3Ryb2tlPSIjY2JkNWUxIiBzdHJva2Utd2lkdGg9IjIiIHJ4PSI0IiAvPjxyZWN0IHg9IjAiIHk9IjUwIiB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNmZmZmZmYiIHN0cm9rZT0iI2NiZDVlMSIgc3Ryb2tlLXdpZHRoPSIyIiByeD0iNCIgLz48cmVjdCB4PSI1MCIgeT0iNTAiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgZmlsbD0iIzNiODJmNiIgc3Ryb2tlPSIjMWUzYThhIiBzdHJva2Utd2lkdGg9IjIiIHJ4PSI0IiAvPjxyZWN0IHg9IjEwMCIgeT0iNTAiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgZmlsbD0iI2ZmZmZmZiIgc3Ryb2tlPSIjY2JkNWUxIiBzdHJva2Utd2lkdGg9IjIiIHJ4PSI0IiAvPjxyZWN0IHg9IjAiIHk9IjEwMCIgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjM2I4MmY2IiBzdHJva2U9IiMxZTNhOGEiIHN0cm9rZS13aWR0aD0iMiIgcng9IjQiIC8+PHJlY3QgeD0iNTAiIHk9IjEwMCIgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjZmZmZmZmIiBzdHJva2U9IiNjYmQ1ZTEiIHN0cm9rZS13aWR0aD0iMiIgcng9IjQiIC8+PHJlY3QgeD0iMTAwIiB5PSIxMDAiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgZmlsbD0iI2ZmZmZmZiIgc3Ryb2tlPSIjY2JkNWUxIiBzdHJva2Utd2lkdGg9IjIiIHJ4PSI0IiAvPjwvZz48L3N2Zz4=";

const AXISYMMETRIC_3X4_IMAGE =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUyIiBoZWlnaHQ9IjIwMiIgdmlld0JveD0iMCAwIDE1MiAyMDIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMSwgMSkiPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgZmlsbD0iI2ZmZmZmZiIgc3Ryb2tlPSIjY2JkNWUxIiBzdHJva2Utd2lkdGg9IjIiIHJ4PSI0IiAvPjxyZWN0IHg9IjUwIiB5PSIwIiB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiMzYjgyZjYiIHN0cm9rZT0iIzFlM2E4YSIgc3Ryb2tlLXdpZHRoPSIyIiByeD0iNCIgLz48cmVjdCB4PSIxMDAiIHk9IjAiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgZmlsbD0iI2ZmZmZmZiIgc3Ryb2tlPSIjY2JkNWUxIiBzdHJva2Utd2lkdGg9IjIiIHJ4PSI0IiAvPjxyZWN0IHg9IjAiIHk9IjUwIiB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNmZmZmZmYiIHN0cm9rZT0iI2NiZDVlMSIgc3Ryb2tlLXdpZHRoPSIyIiByeD0iNCIgLz48cmVjdCB4PSI1MCIgeT0iNTAiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgZmlsbD0iIzNiODJmNiIgc3Ryb2tlPSIjMWUzYThhIiBzdHJva2Utd2lkdGg9IjIiIHJ4PSI0IiAvPjxyZWN0IHg9IjEwMCIgeT0iNTAiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgZmlsbD0iI2ZmZmZmZiIgc3Ryb2tlPSIjY2JkNWUxIiBzdHJva2Utd2lkdGg9IjIiIHJ4PSI0IiAvPjxyZWN0IHg9IjAiIHk9IjEwMCIgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjZmZmZmZmIiBzdHJva2U9IiNjYmQ1ZTEiIHN0cm9rZS13aWR0aD0iMiIgcng9IjQiIC8+PHJlY3QgeD0iNTAiIHk9IjEwMCIgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjM2I4MmY2IiBzdHJva2U9IiMxZTNhOGEiIHN0cm9rZS13aWR0aD0iMiIgcng9IjQiIC8+PHJlY3QgeD0iMTAwIiB5PSIxMDAiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgZmlsbD0iI2ZmZmZmZiIgc3Ryb2tlPSIjY2JkNWUxIiBzdHJva2Utd2lkdGg9IjIiIHJ4PSI0IiAvPjxyZWN0IHg9IjAiIHk9IjE1MCIgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjZmZmZmZmIiBzdHJva2U9IiNjYmQ1ZTEiIHN0cm9rZS13aWR0aD0iMiIgcng9IjQiIC8+PHJlY3QgeD0iNTAiIHk9IjE1MCIgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjM2I4MmY2IiBzdHJva2U9IiMxZTNhOGEiIHN0cm9rZS13aWR0aD0iMiIgcng9IjQiIC8+PHJlY3QgeD0iMTAwIiB5PSIxNTEiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgZmlsbD0iI2ZmZmZmZiIgc3Ryb2tlPSIjY2JkNWUxIiBzdHJva2Utd2lkdGg9IjIiIHJ4PSI0IiAvPjwvZz48L3N2Zz4=";

const COUNTING_RODS_IMAGE =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDYwMCAyNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjYwMCIgaGVpZ2h0PSIyNDAiIGZpbGw9IiNmZmZmZmYiIC8+CiAgPHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iNTgwIiBoZWlnaHQ9IjIyMCIgcng9IjEyIiBmaWxsPSJub25lIiBzdHJva2U9IiMzMzQxNTUiIHN0cm9rZS13aWR0aD0iMiIgLz4KICAKICAmPCEtLSBSb3cgSGVhZGVycyAtLT4KICA8dGV4dCB4PSIzMCIgeT0iNzAiIGZvbnQtZmFtaWx5PSJTaW1IdWksIEFyaWFsIiBmb250LXNpemU9IjIwIiBmaWxsPSIjMzM0MTU1IiBmb250LXdlaWdodD0iYm9sZCI+57m15byPPC90ZXh0PgogIDx0ZXh0IHg9IjMwIiB5PSIxNTAiIGZvbnQtZmFtaWx5PSJTaW1IdWksIEFyaWFsIiBmb250LXNpemU9IjIwIiBmaWxsPSIjMzM0MTU1IiBmb250LXdlaWdodD0iYm9sZCI+5qKrlvI88L3RleHQ+CiAgCiAgPCEtLSBDb2x1bW4gTnVtYmVycyAtLT4KICA8ZyBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2NDc0OGIiIHRleHQtYW5jaG9yPSJtaWRkbGUiPgogICAgPHRleHQgeD0iMTMwIiB5PSIyMTAiPjE8L3RleHQ+CiAgICA8dGV4dCB4PSIxODAiIHk9IjIxMCI+MjwvdGV4dD4KICAgIDx0ZXh0IHg9IjIzMCIgeT0iMjEwIj4zPC90ZXh0PgogICAgPHRleHQgeD0iMjgwIiB5PSIyMTAiPjQ8L3RleHQ+CiAgICA8dGV4dCB4PSIzMzAiIHk9IjIxMCI+NTwvdGV4dD4KICAgIDx0ZXh0IHg9IjM4MCIgeT0iMjEwIj42PC90ZXh0PgogICAgPHRleHQgeD0iNDMwIiB5PSIyMTAiPjc8L3RleHQ+CiAgICA8dGV4dCB4PSI0ODAiIHk9IjIxMCI+ODwvdGV4dD4KICAgIDx0ZXh0IHg9IjUzMCIgeT0iMjEwIj45PC90ZXh0PgogIDwvZz4KCiAgPCEtLSBWZXJ0aWNhbCBTdHlsZSAo57m15byPKSAxLTkgLS0+CiAgPGcgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMzM0MTU1IiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCI+CiAgICA8IS0tIDEgLS0+IDxsaW5lIHgxPSIxMzAiIHkxPSI0MCIgeDI9IjEzMCIgeTI9IjgwIiAvPgogICAgPCEtLSAyIC0tPiA8bGluZSB4MT0iMTc1IiB5MT0iNDAiIHgyPSIxNzUiIHkyPSI4MCIgLz4gPGxpbmUgeDE9IjE4NSIgeTE9IjQwIiB4Mj0iMTg1IiB5Mj0iODAiIC8+CiAgICA8IS0tIDMgLS0+IDxsaW5lIHgxPSIyMjAiIHkxPSI0MCIgeDI9IjIyMCIgeTI9IjgwIiAvPiA8bGluZSB4MT0iMjMwIiB5MT0iNDAiIHgyPSIyMzAiIHkyPSI4MCIgLz4gPGxpbmUgeDE9IjI0MCIgeTE9IjQwIiB4Mj0iMjQwIiB5Mj0iODAiIC8+CiAgICA8IS0tIDQgLS0+IDxsaW5lIHgxPSIyNjUiIHkxPSI0MCIgeDI9IjI2NSIgeTI9IjgwIiAvPiA8bGluZSB4MT0iMjc1IiB5MT0iNDAiIHgyPSIyNzUiIHkyPSI4MCIgLz4gPGxpbmUgeDE9IjI4NSIgeTE9IjQwIiB4Mj0iMjg1IiB5Mj0iODAiIC8+IDxsaW5lIHgxPSIyOTUiIHkxPSI0MCIgeDI9IjI5NSIgeTI9IjgwIiAvPgogICAgPCEtLSA1IC0tPiA8bGluZSB4MT0iMzEwIiB5MT0iNDAiIHgyPSIzMTAiIHkyPSI4MCIgLz4gPGxpbmUgeDE9IjMyMCIgeTE9IjQwIiB4Mj0iMzIwIiB5Mj0iODAiIC8+IDxsaW5lIHgxPSIzMzAiIHkxPSI0MCIgeDI9IjMzMCIgeTI9IjgwIiAvPiA8bGluZSB4MT0iMzQwIiB5MT0iNDAiIHgyPSIzNDAiIHkyPSI4MCIgLz4gPGxpbmUgeDE9IjM1MCIgeTE9IjQwIiB4Mj0iMzUwIiB5Mj0iODAiIC8+CiAgICA8IS0tIDYgLS0+IDxsaW5lIHgxPSIzNjUiIHkxPSI0MCIgeDI9IjM5NSIgeTI9IjQwIiAvPiA8bGluZSB4MT0iMzgwIiB5MT0iNDAiIHgyPSIzODAiIHkyPSI4MCIgLz4KICAgIDwhLS0gNyAtLT4gPGxpbmUgeDE9IjQxNSIgeTE9IjQwIiB4Mj0iNDQ1IiB5Mj0iNDAiIC8+IDxsaW5lIHgxPSI0MjUiIHkxPSI0MCIgeDI9IjQyNSIgeTI9IjgwIiAvPiA8bGluZSB4MT0iNDM1IiB5MT0iNDAiIHgyPSI0MzUiIHkyPSI4MCIgLz4KICAgIDwhLS0gOCAtLT4gPGxpbmUgeDE9IjQ2NSIgeTE9IjQwIiB4Mj0iNDk1IiB5Mj0iNDAiIC8+IDxsaW5lIHgxPSI0NzAiIHkxPSI0MCIgeDI9IjQ3MCIgeTI9IjgwIiAvPiA8bGluZSB4MT0iNDgwIiB5MT0iNDAiIHgyPSI0ODAiIHkyPSI4MCIgLz4gPGxpbmUgeDE9IjQ5MCIgeTE9IjQwIiB4Mj0iNDkwIiB5Mj0iODAiIC8+CiAgICA8IS0tIDkgLS0+IDxsaW5lIHgxPSI1MTUiIHkxPSI0MCIgeDI9IjU0NSIgeTI9IjQwIiAvPiA8bGluZSB4MT0iNTE4IiB5MT0iNDAiIHgyPSI1MTgiIHkyPSI4MCIgLz4gPGxpbmUgeDE9IjUyNiIgeTE9IjQwIiB4Mj0iNTI2IiB5Mj0iODAiIC8+IDxsaW5lIHgxPSI1MzQiIHkxPSI0MCIgeDI9IjUzNCIgeTI9IjgwIiAvPiA8bGluZSB4MT0iNTQyIiB5MT0iNDAiIHgyPSI1NDIiIHkyPSI4MCIgLz4KICA8L2c+CgogIDwhLS0gSG9yaXpvbnRhbCBTdHlsZSAo5qKrlvI8KSAxLTkgLS0+CiAgPGcgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMzM0MTU1IiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCI+CiAgICA8IS0tIDEgLS0+IDxsaW5lIHgxPSIxMTUiIHkxPSIxNTAiIHgyPSIxNDUiIHkyPSIxNTAiIC8+CiAgICA8IS0tIDIgLS0+IDxsaW5lIHgxPSIxNjUiIHkxPSIxNDUiIHgyPSIxOTUiIHkyPSIxNDUiIC8+IDxsaW5lIHgxPSIxNjUiIHkxPSIxNTUiIHgyPSIxOTUiIHkyPSIxNTUiIC8+CiAgICA8IS0tIDMgLS0+IDxsaW5lIHgxPSIyMTUiIHkxPSIxNDAiIHgyPSIyNDUiIHkyPSIxNDAiIC8+IDxsaW5lIHgxPSIyMTUiIHkxPSIxNTAiIHgyPSIyNDUiIHkyPSIxNTAiIC8+IDxsaW5lIHgxPSIyMTUiIHkxPSIxNjAiIHgyPSIyNDUiIHkyPSIxNjAiIC8+CiAgICA8IS0tIDQgLS0+IDxsaW5lIHgxPSIyNjUiIHkxPSIxMzUiIHgyPSIyOTUiIHkyPSIxMzUiIC8+IDxsaW5lIHgxPSIyNjUiIHkxPSIxNDUiIHgyPSIyOTUiIHkyPSIxNDUiIC8+IDxsaW5lIHgxPSIyNjUiIHkxPSIxNTUiIHgyPSIyOTUiIHkyPSIxNTUiIC8+IDxsaW5lIHgxPSIyNjUiIHkxPSIxNjUiIHgyPSIyOTUiIHkyPSIxNjUiIC8+CiAgICA8IS0tIDUgLS0+IDxsaW5lIHgxPSIzMTUiIHkxPSIxMzAiIHgyPSIzNDUiIHkyPSIxMzAiIC8+IDxsaW5lIHgxPSIzMTUiIHkxPSIxNDAiIHgyPSIzNDUiIHkyPSIxNDAiIC8+IDxsaW5lIHgxPSIzMTUiIHkxPSIxNTAiIHgyPSIzNDUiIHkyPSIxNTAiIC8+IDxsaW5lIHgxPSIzMTUiIHkxPSIxNjAiIHgyPSIzNDUiIHkyPSIxNjAiIC8+IDxsaW5lIHgxPSIzMTUiIHkxPSIxNzAiIHgyPSIzNDUiIHkyPSIxNzAiIC8+CiAgICA8IS0tIDYgLS0+IDxsaW5lIHgxPSIzODAiIHkxPSIxNDAiIHgyPSIzODAiIHkyPSIxNzAiIC8+IDxsaW5lIHgxPSIzNjUiIHkxPSIxNzAiIHgyPSIzOTUiIHkyPSIxNzAiIC8+CiAgICA8IS0tIDcgLS0+IDxsaW5lIHgxPSI0MzAiIHkxPSIxNDAiIHgyPSIzODAiIHkyPSIxNzAiIC8+IDwhLS0gV2FpdCwgNyBpcyAxIHZlcnRpY2FsIGFib3ZlLCAyIGhvcml6b250YWwgYmVsb3cgLS0+CiAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSg0MzAsIDE1MCkiPgogICAgICA8bGluZSB4MT0iMCIgeTE9Ii0xMCIgeDI9IjAiIHkyPSIxMCIgLz4KICAgICAgPGxpbmUgeDE9Ii0xNSIgeTE9IjEwIiB4Mj0iMTUiIHkyPSIxMCIgLz4KICAgICAgPGxpbmUgeDE9Ii0xNSIgeTE9IjIwIiB4Mj0iMTUiIHkyPSIyMCIgLz4KICAgIDwvZz4KICAgIDwhLS0gOCAtLT4KICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDQ4MCwgMTUwkiPgogICAgICA8bGluZSB4MT0iMCIgeTE9Ii0xMCIgeDI9IjAiIHkyPSIxMCIgLz4KICAgICAgPGxpbmUgeDE9Ii0xNSIgeTE9IjEwIiB4Mj0iMTUiIHkyPSIxMCIgLz4KICAgICAgPGxpbmUgeDE9Ii0xNSIgeTE9IjIwIiB4Mj0iMTUiIHkyPSIyMCIgLz4KICAgICAgPGxpbmUgeDE9Ii0xNSIgeTE9IjMwIiB4Mj0iMTUiIHkyPSIzMCIgLz4KICAgIDwvZz4KICAgIDwhLS0gOSAtLT4KICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDUzMCwgMTUwkiPgogICAgICA8bGluZSB4MT0iMCIgeTE9Ii0xMCIgeDI9IjAiIHkyPSIxMCIgLz4KICAgICAgPGxpbmUgeDE9Ii0xNSIgeTE9IjEwIiB4Mj0iMTUiIHkyPSIxMCIgLz4KICAgICAgPGxpbmUgeDE9Ii0xNSIgeTE9IjIwIiB4Mj0iMTUiIHkyPSIyMCIgLz4KICAgICAgPGxpbmUgeDE9Ii0xNSIgeTE9IjMwIiB4Mj0iMTUiIHkyPSIzMCIgLz4KICAgICAgPGxpbmUgeDE9Ii0xNSIgeTE9IjQwIiB4Mj0iMTUiIHkyPSI0MCIgLz4KICAgIDwvZz4KICA8L2c+Cjwvc3ZnPg==";

const MEASURING_CUP_IMAGE =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmOGZhZmMiIHJ4PSIxMiIgLz48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMDAsIDEwMCkgcm90YXRlKDQ1KSI+PHBvbHlnb24gcG9pbnRzPSI1MCw1MCAtNTAsNTAgLTUwLDI1IDUwLC01MCIgZmlsbD0iI2NiZDVlMSIgc3Ryb2tlPSJub25lIiAvPjxsaW5lIHgxPSItNTAiIHkxPSIyNSIgeDI9Ii00MiIgeTI9IjI1IiBzdHJva2U9IiMzMzQxNTUiIHN0cm9rZS13aWR0aD0iMi41IiAvPjxsaW5lIHgxPSItNTAiIHkxPSIwIiB4Mj0iLTQyIiB5Mj0iMCIgc3Ryb2tlPSIjMzM0MTU1IiBzdHJva2Utd2lkdGg9IjIuNSIgLz48bGluZSB4MT0iLTUwIiB5MT0iLTI1IiB4Mj0iLTQyIiB5Mj0iLTI1IiBzdHJva2U9IiMzMzQxNTUiIHN0cm9rZS13aWR0aD0iMi41IiAvPjxwb2x5Z29uIHBvaW50cz0iNTAsNTAgLTUwLDUwIC01MCwyNSA1MCwtNTAiIGZpbGw9IiM5M2M1ZmQiIG9wYWNpdHk9IjAuODUiIC8+PGxpbmUgeDE9IjUwIiB5MT0iLTUwIiB4Mj0iLTUwIiB5Mj0iMjUiIHN0cm9rZT0iIzFkNGVkOCIgc3Ryb2tlLXdpZHRoPSIzLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgLz48cmVjdCB4PSItNTAiIHk9Ii01MCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzMzNDE1NSIgc3Ryb2tlLXdpZHRoPSIzLjUiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgLz48L2c+PC9zdmc+";

const GEOMETRY_PROOF_IMAGE =
  "data:image/svg+xml;utf8,<svg width='450' height='300' viewBox='0 0 450 300' xmlns='http://www.w3.org/2000/svg'><rect width='450' height='300' fill='%23ffffff' /><path d='M 170 150 A 20 20 0 0 0 161.5 133.5' fill='none' stroke='%23334155' stroke-width='1.5' /><path d='M 100 250 A 20 20 0 0 0 91.5 233.5' fill='none' stroke='%23334155' stroke-width='1.5' /><path d='M 270 150 A 20 20 0 0 1 278.5 133.5' fill='none' stroke='%23334155' stroke-width='1.5' /><path d='M 340 250 A 20 20 0 0 1 348.5 233.5' fill='none' stroke='%23334155' stroke-width='1.5' /><line x1='220' y1='50' x2='80' y2='250' stroke='%23334155' stroke-width='2.5' stroke-linecap='round' /><line x1='80' y1='250' x2='360' y2='250' stroke='%23334155' stroke-width='2.5' stroke-linecap='round' /><line x1='360' y1='250' x2='220' y2='50' stroke='%23334155' stroke-width='2.5' stroke-linecap='round' /><line x1='150' y1='150' x2='290' y2='150' stroke='%23334155' stroke-width='2.5' stroke-linecap='round' /><circle cx='220' cy='50' r='3' fill='%23334155' /><circle cx='80' cy='250' r='3' fill='%23334155' /><circle cx='360' cy='250' r='3' fill='%23334155' /><circle cx='150' cy='150' r='3' fill='%23334155' /><circle cx='290' cy='150' r='3' fill='%23334155' /><text x='212' y='42' font-family='Arial, sans-serif' font-size='18' font-weight='bold' fill='%23334155'>A</text><text x='58' y='260' font-family='Arial, sans-serif' font-size='18' font-weight='bold' fill='%23334155'>B</text><text x='372' y='260' font-family='Arial, sans-serif' font-size='18' font-weight='bold' fill='%23334155'>C</text><text x='128' y='156' font-family='Arial, sans-serif' font-size='18' font-weight='bold' fill='%23334155'>D</text><text x='302' y='156' font-family='Arial, sans-serif' font-size='18' font-weight='bold' fill='%23334155'>E</text><text x='176' y='142' font-family='Arial, sans-serif' font-size='16' font-weight='bold' fill='%23334155'>1</text><text x='256' y='142' font-family='Arial, sans-serif' font-size='16' font-weight='bold' fill='%23334155'>2</text></svg>";

const QUADRILATERAL_OUTER_ANGLES_IMAGE =
  "data:image/svg+xml;utf8,<svg width='450' height='300' viewBox='0 0 450 300' xmlns='http://www.w3.org/2000/svg'><rect width='450' height='300' fill='%23ffffff' /><path d='M 284 68 A 22 22 0 0 0 258 93' fill='none' stroke='%23ea580c' stroke-width='2' /><path d='M 282 186 A 22 22 0 0 0 256 168' fill='none' stroke='%23ea580c' stroke-width='2' /><path d='M 164 232 A 22 22 0 0 0 182 206' fill='none' stroke='%23ea580c' stroke-width='2' /><path d='M 118 113 A 22 22 0 0 0 144 132' fill='none' stroke='%23ea580c' stroke-width='2' /><line x1='260' y1='190' x2='290' y2='40' stroke='%23334155' stroke-width='2.5' stroke-linecap='round' /><line x1='280' y1='90' x2='90' y2='117' stroke='%23334155' stroke-width='2.5' stroke-linecap='round' /><line x1='140' y1='110' x2='170' y2='260' stroke='%23334155' stroke-width='2.5' stroke-linecap='round' /><line x1='160' y1='210' x2='310' y2='180' stroke='%23334155' stroke-width='2.5' stroke-linecap='round' /><text x='250' y='65' font-family='Arial, sans-serif' font-size='18' font-weight='bold' fill='%23ea580c'>1</text><text x='292' y='162' font-family='Arial, sans-serif' font-size='18' font-weight='bold' fill='%23ea580c'>2</text><text x='182' y='245' font-family='Arial, sans-serif' font-size='18' font-weight='bold' fill='%23ea580c'>3</text><text x='102' y='145' font-family='Arial, sans-serif' font-size='18' font-weight='bold' fill='%23ea580c'>4</text><text x='40' y='260' font-family='Georgia, serif' font-style='italic' font-size='16' fill='%2364748b'>图 3</text></svg>";

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
    const seed10Id = "seed-problem-10-v1"; // New challenge for April 14th
    const seed11Id = "seed-problem-11-v1"; // New challenge for April 16th
    const seed12Id = "seed-problem-12-v1"; // New challenge for May 12th
    const seed13Id = "seed-problem-13-v2"; // New challenge for May 19th
    const seed14Id = "seed-problem-14-v1"; // New challenge for May 20th
    const seed15Id = "seed-problem-15-v2"; // New challenge for May 26th
    const seed16Id = "seed-problem-16-v1"; // New challenge for June 8th
    const seed17Id = "seed-problem-17-v2"; // New challenge for June 9th (v2 with two problems)
    const seed18Id = "seed-problem-18-v1"; // New challenge for June 10th
    const seed19Id = "seed-problem-19-v1"; // New challenge for June 16th

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
    const hasSeed10 = currentProblems.some(
      (p) => p.id === seed10Id || p.title === "4月14日星级挑战",
    );
    const hasSeed11 = currentProblems.some(
      (p) => p.id === seed11Id || p.title === "4月16日星级挑战",
    );
    const hasSeed12 = currentProblems.some(
      (p) => p.id === seed12Id || p.title === "5月12日星级挑战",
    );
    const hasSeed13 = currentProblems.some(
      (p) => p.id === seed13Id || p.title === "5月19日星级挑战",
    );
    const hasSeed14 = currentProblems.some(
      (p) => p.id === seed14Id || p.title === "5月20日星级挑战",
    );
    const hasSeed15 = currentProblems.some(
      (p) => p.id === seed15Id,
    );
    const hasSeed16 = currentProblems.some(
      (p) => p.id === seed16Id,
    );
    const hasSeed17 = currentProblems.some(
      (p) => p.id === seed17Id,
    );
    const hasSeed18 = currentProblems.some(
      (p) => p.id === seed18Id,
    );
    const hasSeed19 = currentProblems.some(
      (p) => p.id === seed19Id,
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

    if (!hasSeed10) {
      const initialProblem10: MathProblem = {
        id: seed10Id,
        date: "2026-04-14",
        title: "4月14日星级挑战",
        unlockTime: "14:00",
        createdAt: Date.now() + 9000,
        problems: [
          {
            id: "sub-10-1",
            content:
              "小马虎在化简一个小数部分是三位的小数时，把小数部分的“0”去掉了，结果写成了4.9，已知这个结果大小是错误的，原来这个小数可能是？",
            difficulty: 2,
            solution: `## 【第一步：审题与分析】\n1. 原来的小数部分有 **三位**。\n2. 小马虎去掉了小数部分的“0”后，变成了 **4.9**。\n3. 关键信息：**结果大小是错误的**。这意味着被去掉的“0”不是末尾的零（因为去掉末尾的零不改变小数的大小）。\n\n## 【第二步：逆向推理】\n我们要把 0 填回到 4.9 的小数部分，使其变成三位小数，且数值发生变化。\n\n4.9 的小数部分是“9”。我们要加入两个 0 变成三位：\n\n1. **4.009**：去掉 0 后变成 4.9。数值从 4.009 变为 4.9，大小改变了，符合条件。\n2. **4.090**：去掉 0 后变成 4.9。数值从 4.09 变为 4.9，大小改变了，符合条件。\n3. **4.900**：去掉 0 后变成 4.9。数值没变（$4.900 = 4.9$），不符合“大小错误”的条件。\n\n## 【结论】\n原来这个小数可能是 **4.009** 或 **4.090**。`,
          },
        ],
      };
      updatedProblems.push(initialProblem10);
      needsUpdate = true;
    }

    if (!hasSeed11) {
      const initialProblem11: MathProblem = {
        id: seed11Id,
        date: "2026-04-16",
        title: "4月16日星级挑战",
        unlockTime: "14:00",
        createdAt: Date.now() + 10000,
        problems: [
          {
            id: "sub-11-1",
            content: `### 阅读材料，解决问题\n\n**材料一**：我国古代曾用算筹表示数。在算筹记数法中，以纵式和横式两种方式表示数字。\n用算筹表示数的时候，个位用纵式，十位用横式，百位用纵式，千位用横式，以此类推，把各个数位上的数表示出来。遇到零，则用空位表示。\n\n右图中：\n- **图①** 是算筹表示 1～9 的两种方式（纵式和横式）。\n- **图②** 是用算筹表示的一个三位数。\n\n请根据以上材料，填空并解答下面的问题：\n\n1. 图②表示的三位数是 **（       ）**。\n2. 如果在图②这三个数位中的某个数位上再多放一根算筹，能表示的最大三位数是 **（       ）**。`,
            imageUrl: COUNTING_RODS_IMAGE,
            difficulty: 4,
            solution: `## 【第一步：解读图中的算筹表示法】\n根据材料，个位用**纵式**，十位用**横式**，百位用**纵式**。\n我们对照 **图①**：\n- **百位（纵式）**：有三根竖立的算筹，对照图①，这代表数字 **3**。\n- **十位（横式）**：一根竖算筹在左侧作为辅助线（或直接代表5），配合两根横算筹，即 $5 + 2 = 7$，对照图①中的横式 7，这代表数字 **7**。\n- **个位（纵式）**：两根竖立的算筹，对照图①，这代表数字 **2**。\n\n因此，图②表示的三位数是：**372**。\n\n## 【第二步：多放一根算筹后的最大数计算】\n题目要求在这三个数位中的**某个数位上再多放一根算筹**，并且要使得到的三位数**最大**。\n我们依次分析在每个数位上多放一根算筹可以变成哪些新数字：\n\n### 1. 如果在百位（当前为 3，纵式）多放一根算筹：\n此时百位共有 4 根算筹。在**纵式**表示法中，4 根算筹可以代表：\n- **4**（四根竖算筹）\n- **8**（一根横算筹放在上方代表 5，剩下三根竖算筹，共 4 根算筹，代表 $5 + 3 = 8$）\n因此，百位通过添加一根算筹可以使得当前数值从 3 变成 **4** 或 **8**。\n\n### 2. 如果在十位（当前为 7，横式）多放一根算筹：\n当前 7 是由 3 根算筹组成的（一根竖的代表 5，两根横的代表 2）。多放一根算筹后共有 4 根算筹。\n在**横式**表示法中，4 根算筹可以代表：\n- **4**（四根横算筹）\n- **8**（一根竖算筹放在左侧代表 5，剩下三根横算筹，共 4 根算筹，代表 $5 + 3 = 8$）\n因此，十位可以从 7 变成 **8**。\n\n### 3. 如果在个位（当前为 2，纵式）多放一根算筹：\n当前 2 是由 2 根竖算筹组成的。多放一根后共有 3 根算筹。\n在**纵式**表示法中，3 根算筹可以代表：\n- **3**（三根竖算筹）\n- **7**（一根横算筹在上方代表 5，两根竖算筹在下方，共 3 根算筹，代表 $5 + 2 = 7$）\n因此，个位可以从 2 变成 **3** 或 **7**。\n\n## 【第三步：比较并找出最大三位数】\n我们将各个可能形成的新数进行组合比较：\n- 改变百位（百位变 8）：可得到的最大数是 **872**\n- 改变十位（十位变 8）：可得到的数是 **382**\n- 改变个位（个位变 7）：可得到的最大数是 **377**\n\n比较可得，$872 > 377 > 382$，所以能表示的最大三位数是 **872**。\n\n## 【结论】\n1. 图②表示的数是 **372**；\n2. 增加一根算筹后能表示的最大三位数是 **872**。`,
          },
        ],
      };
      updatedProblems.push(initialProblem11);
      needsUpdate = true;
    }

    if (!hasSeed15) {
      // Remove any old seed 15 versions to avoid duplicates
      updatedProblems = updatedProblems.filter(
        (p) => p.id !== "seed-problem-15-v1" && p.title !== "5月26日星级挑战"
      );
      const initialProblem15: MathProblem = {
        id: seed15Id,
        date: "2026-05-26",
        title: "5月26日星级挑战",
        unlockTime: "14:00",
        createdAt: Date.now() + 14000,
        problems: [
          {
            id: "sub-15-1",
            content: "## **第一题：图形的轴对称 (3星)**\n\n### 在下面的 3x3 图形中，再给 **1 个** 小方格涂上颜色，使涂色部分成为一个轴对称图形，一共有多少种不同的涂法？",
            imageUrl: AXISYMMETRIC_3X3_IMAGE,
            difficulty: 3,
            solution: "## 【第一步：分析已有图形的对称性】\n观察给出的 3×3 网络图，已有 3 个蓝色格子。设行号为 1~3（从上到下），列号为 1~3（从左到右）：\n- 已二倍色位置：(1,1)，(2,2)，(3,1)\n- 该图形本身已经关于**水平中线**对称：(1,1) 与 (3,1) 互为对称点，(2,2) 位于中线上。\n\n## 【第二步：寻找新增 1 个格子使其轴对称的方案】\n轴对称图形的对称轴可以是：水平中线、垂直中线、主对角线、副对角线。我们分别尝试：\n\n1. **保持关于“水平中线”对称：**\n   新增的一个格子也必须落在线对称点上，或者自身位于对称轴上。\n   - 位于水平中在线的未涂色格子有：(2,1) 和 (2,3)。\n   - 如果涂色 **(2,1)**：图形具有水平对称轴（行1与行3对称，行2内部对称）。符合条件！\n   - 如果涂色 **(2,3)**：图形具有水平对称轴。符合条件！\n\n2. **使图形关于“主对角线（左上到右下）”对称：**\n   - 已有格子 (1,1) 和 (2,2) 已经在对角线上，只需让 (3,1) 的对称点 (1,3) 也被涂色。\n   - 如果涂色 **(1,3)**：整个图形将关于主对角线完美对称。符合条件！\n\n3. **使图形关于“副对角线（右上到左下）”对称：**\n   - 已有格子 (3,1) 和 (2,2) 已经在对角线上，只需让 (1,1) 的对称点 (3,3) 也被涂色。\n   - 如果涂色 **(3,3)**：整个图形将关于副对角线完美对称。符合条件！\n\n## 【结论】\n一共有 **4** 种不同的涂法，分别涂在以下网格位置：\n1. 第二行第一列 (2,1)\n2. 第二行第三列 (2,3)\n3. 第一行第三列 (1,3)\n4. 第三行第三列 (3,3)",
          },
          {
            id: "sub-15-2",
            content: "## **第二题：几何直观 - 轴对称 (3星)**\n\n### 在如图所示的图形中，再给 **2 个** 格子涂上颜色，使涂色部分成为一个轴对称图形。一共有多少种不同的涂法？",
            imageUrl: AXISYMMETRIC_3X4_IMAGE,
            difficulty: 3,
            solution: "## 【第一步：分析已有图形的特征】\n该图形是一个 3 列 4 行的矩形网络，已有 4 个蓝色格子，全部位于**中间第二列**（全满）。\n- 这说明现有的蓝色部分已经是针对垂直轴 and 水平轴完全对称的。\n- 我们现在要再选取 **2 个** 白色格子涂色，使最终完整的涂色部分构成一个轴对称图形。\n\n## 【第二步：确定可能存在的对称轴】\n由于这是一个非正方形的 3×4 矩形，其可能的对称轴只有两条：\n1. **垂直中线 (纵向对称轴)** —— 穿过第2列的中心。\n2. **水平中线 (横向对称轴)** —— 穿过第2行与第3行之间的中线。\n\n## 【第三步：讨论这两种对称方式下的独立涂法】\n\n### 情况 A：关于“垂直中线”对称\n要把 2 个新增格子涂色，使它们关于垂直中轴线对称。由于第二列已经全满，我们只能选择第一列和第三列中的格子，并且必须成对选择：一对关于一列对称的格子 is $(Row, 1)$ and $(Row, 3)$。\n- 行1可以选：(1,1) 和 (1,3)\n- 行2可以选：(2,1) 和 (2,3)\n- 行3可以选：(3,1) 和 (3,3)\n- 行4可以选：(4,1) 和 (4,3)\n\n这共有 **4** 种不同的两格涂法。每一组都可以保证图形具有纵向轴对称性。\n\n### 情况 B：关于“水平中线”对称\n要把 2 个新增格子涂色，使它们关于中间的横向中线对称。每一列需要两两对称：\n- 第一列关于横向中轴对称的配对有：\n  - 第一组：(1,1) 和 (4,1)\n  - 第二组：(2,1) 和 (3,1)\n- 第三列关于横向中轴对称的配对有：\n  - 第三组：(1,3) 和 (4,3)\n  - 第四组：(2,3) 和 (3,3)\n\n这共有 **4** 种不同的两格涂法（第一列2个或第三列2个）。每一组都可以保证图形具有横向轴对称性。\n\n## 【第四步：检查冲突与去重】\n情况 A 的 4 种方案均在**同一行**内选格（两个格子横向对称分布于中间列的两侧）。\n情况 B 的 4 种方案均在**同一列**内选格（两个格子纵向对称分布于水平中心线的两侧，同在第一列或同在第三列）。\n由于选择的方格集合没有任何交叉重合，所以这两类情况是完全独立的，没有重复计算的组合。\n\n## 【结论】\n一共有 $4 + 4 = 8$ 种不同的涂法。 (选项中选择 **A. 8**)",
          },
        ],
      };
      updatedProblems.push(initialProblem15);
      needsUpdate = true;
    }

    if (!hasSeed16) {
      const initialProblem16: MathProblem = {
        id: seed16Id,
        date: "2026-06-08",
        title: "6月8日星级挑战",
        unlockTime: "14:00",
        createdAt: Date.now() + 15000,
        problems: [
          {
            id: "sub-16-1",
            content: "## **第一题：几何直观 - 倾斜量杯的容积 (2星)**\n\n### 右图中的方形量杯装满水，最多可装 **200 克**。现在将量杯倾斜，水面刚好如图所示。请问现在的量杯里有多少克水？\n\n*(注：杯壁上的刻度将杯口边缘平均分成 4 份)*",
            imageUrl: MEASURING_CUP_IMAGE,
            difficulty: 2,
            solution: "## 【第一步：图形的对称原理分析】\n由于这是一个正方形容器，当我们把它倾斜 45 度放置时，其内部的空间可以通过对角线来进行巧妙的拆分：\n- **对角线 $BD$**（连接左、右两个顶点）将整个 200 克容量的正方形量杯平分成了上下两个完全相等的直角三角形：\n  - **下半部分（三角形 $ABD$）**：处于对角线之下，这部分完全装满了水。其容积为总容量的一半：\n    $$200\\text{ 克} \\div 2 = 100\\text{ 克}$$\n  - **上半部分（三角形 $BCD$）**：处于对角线之上。这部分的容积同样是总容量的一半，也就是 100 克。\n\n## 【第二步：对角线上部的水量分析】\n观察量杯的刻度与水面线：\n- 量杯的左上边缘 $CD$ 被 3 个刻度线平均平分成了 **4 个大小相等的区间**。\n- 水面线的一端落在对角线的右端点 $B$，另一端点刚好落在 $CD$ 边缘自下而上的**第一个刻度线**处（靠近 $D$ 点的第一个刻度 W）。\n\n由于连接顶点 $B$ 到边缘 $CD$ 分割点的线段将上半部分的三角形 $BCD$ 划分为了等高的小三角形：\n- 这些小三角形都共享顶点 $B$，因此它们关于 $CD$ 边缘的高度是完全一样的。\n- 它们的底边分别为 $CD$ 上的 4 等分段。底边相等、高相等，说明**这 4 个小三角形的面积（容积）是完全相等的**。\n- 每一等分小三角形代表的重量为：\n  $$100\\text{ 克} \\div 4 = 25\\text{ 克}$$\n\n## 【第三步：求总水量】\n根据水面线，现在量杯中的水包含了：\n1. **下部完美装满的完整三角形 $ABD$**：$100$ 克。\n2. **上部三角形中占了第一个等分的那个小三角形**：$25$ 克。\n\n所以，现在量杯中水的重量为：\n$$100\\text{ 克} + 25\\text{ 克} = 125\\text{ 克}$$\n\n## 【结论】\n现在的量杯里一共有 **125** 克水。",
          },
          {
            id: "sub-16-2",
            content: "## **第二题：经典应用题 - 鸡兔同笼变形 (3星)**\n\n### 100 个和尚吃 100 个馒头。大和尚一人吃 3 个，小和尚 3 人吃一个。大、小和尚各有多少人？",
            imageUrl: null,
            difficulty: 3,
            solution: "## 【第一步：分析题意，明确关系】\n本题是一道经典应用题，可以通过列方程组或假设法（类似鸡兔同笼）来解答。\n- **总量关系 1**：大和尚人数 + 小和尚人数 = 100 人\n- **总量关系 2**：大和尚吃馒头数 + 小和尚吃馒头数 = 100 个\n- **吃馒头标准**：大和尚 $1 \\times 3 = 3$ 个；小和尚 3 人吃 1 个，即平均每人吃 $\\frac{1}{3}$ 个。\n\n## 【第二步：解法一 —— 假设法（鸡兔同笼思想）】\n假设这 100 个人**全部是小和尚**：\n- 1. 他们总共只能吃：\n  $$100 \\times \\frac{1}{3} = 33\\frac{1}{3}\\text{ 个馒头}$$\n- 2. 此时馒头数比实际少吃：\n  $$100 - 33\\frac{1}{3} = 66\\frac{2}{3}\\text{ 个馒头}$$\n- 3. 一个大和尚比一个小和尚多吃：\n  $$3 - \\frac{1}{3} = 2\\frac{2}{3}\\text{ 个馒头}$$\n- 4. 那么，大和尚的人数就是：\n  $$\\text{大和尚人数} = 66\\frac{2}{3} \\div 2\\frac{2}{3} = \\frac{200}{3} \\div \\frac{8}{3} = 25\\text{ 人}$$\n- 5. 小和尚的人数为：\n  $$\\text{小和尚人数} = 100 - 25 = 75\\text{ 人}$$\n\n## 【第三步：解法二 —— 列方程组法】\n设大和尚的人数为 $x$ 人，小和尚的人数为 $y$ 人：\n1. 根据人数：\n   $$x + y = 100 \\implies y = 100 - x$$\n2. 根据馒头数：\n   $$3x + \\frac{1}{3}y = 100$$\n\n将 $y = 100 - x$ 代入方程 2 中：\n$$3x + \\frac{100 - x}{3} = 100$$\n\n方程两边同时乘以 3：\n$$9x + (100 - x) = 300$$\n$$8x + 100 = 300$$\n$$8x = 200$$\n$$x = 25$$\n\n求出大和尚 $x = 25$ 人，则小和尚为：\n$$y = 100 - 25 = 75\\text{ 人}$$\n\n## 【第四步：代入验算】\n- 25 名大和尚，每人吃 3 个：$25 \\times 3 = 75$ 个馒头；\n- 75 名小和尚，每 3 人吃 1 个：$75 \\div 3 = 25$ 个馒头；\n- 馒头总数：$75 + 25 = 100$ 个；人总数：$25 + 75 = 100$ 口人。完全符合题意！\n\n## 【结论】\n大和尚有 **25** 人，小和尚有 **75** 人。",
          },
        ],
      };
      updatedProblems.push(initialProblem16);
      needsUpdate = true;
    }

    if (!hasSeed17) {
      // Remove any old seed 17 versions to avoid duplicates
      updatedProblems = updatedProblems.filter(
        (p) => p.id !== "seed-problem-17-v1" && p.id !== "seed-problem-17-v2" && p.title !== "6月9日星级挑战"
      );
      const initialProblem17: MathProblem = {
        id: seed17Id,
        date: "2026-06-09",
        title: "6月9日星级挑战",
        unlockTime: "14:00",
        createdAt: Date.now() + 16000,
        problems: [
          {
            id: "sub-17-1",
            content: "## **第一题：鸡兔同笼变形 (3星)**\n\n### 笼子里有鸡和兔，一共有 **26 只脚**。\n### 后来又往笼子里放进若干只兔，并抓出同样多的鸡，这时笼子里有 **32 只脚**。\n\n### 问：后来放进了多少只兔？",
            imageUrl: null,
            difficulty: 3,
            solution: "## 【第一步：分析“一进一出”的数量变化】\n题目中提到：**往笼子里放进若干只兔，并抓出同样多的鸡**。\n这意味着这是一次“兔进鸡出”的等额替换：\n- 每一组替换（**放进 1 只兔，同时抓出 1 只鸡**），笼子里动物的总只数不变。\n- 但是由于兔 and 鸡的脚数不同，每替换一次，笼子里的脚数会发生变化：\n  - 1 只兔有 **4 只脚**\n  - 1 只鸡有 **2 只脚**\n  - 每放进 1 只兔并抓出 1 只鸡，笼子里的脚数就会增加：\n    $$4\\text{ 只} - 2\\text{ 只} = 2\\text{ 只脚}$$\n\n## 【第二步：求出脚的总增加量】\n根据题意：\n- 初始脚的数量：**26 只**\n- 最终脚的数量：**32 只**\n- 笼子里脚数一共增加了：\n  $$32 - 26 = 6\\text{ 只脚}$$\n\n## 【第三步：求出放进兔子的数量】\n因为每进行一次“兔进鸡出”的替换，脚数就会多 2 只。\n现在一共多了 6 只脚，说明进行了：\n$$6\\text{ 只脚} \\div 2\\text{ 只脚/次} = 3\\text{ 次替换}$$\n\n既然进行了 3 次替换，也就是说后来放进了 **3 只兔**（同时也抓出了 3 只鸡）。\n\n## 【第四步：代入验算】\n我们可以验证是否存在符合初始条件（26只脚）且鸡的只数至少有3只（能够被抓出）的情况：\n- 假设最开始有 7 只鸡，3 只兔：\n  - 初始脚数：$7 \\times 2 + 3 \\times 4 = 14 + 12 = 26$ 只脚。符合条件！\n  - 后来抓出 3 只鸡（剩下 4 只），放进 3 只兔（变成 6 只）：\n    - 最终脚数：$4 \\times 2 + 6 \\times 4 = 8 + 24 = 32$ 只脚。完全符合条件！\n\n- 假设最开始有 9 只鸡，2 只兔：\n  - 初始脚数：$9 \\times 2 + 2 \\times 4 = 18 + 8 = 26$ 只脚。符合条件！\n  - 后来抓出 3 只鸡（剩下 6 只），放进 3 只兔（变成 5 只）：\n    - 最终脚数：$6 \\times 2 + 5 \\times 4 = 12 + 20 = 32$ 只脚。完全符合条件！\n\n因此，无论最开始的具体只数是多少（只要能满足初始 26 只脚且鸡不少于 3 只），结论都是唯一的。\n\n## 【结论】\n后来一共放进了 **3** 只兔。",
          },
          {
            id: "sub-17-2",
            content: "## **第二题：巧求未知数 (2星)**\n\n### 在下面的算式中，求出 **☆** 代表的数：\n\n### **$$48 - \\text{☆} \\div 8 = 40$$**\n\n### 问：**☆ = （       ）**",
            imageUrl: null,
            difficulty: 2,
            solution: "## 【第一步：分析算式结构与运算顺序】\n观察算式：\n$$48 - \\text{☆} \\div 8 = 40$$\n\n根据有括号 and 乘除先算、加减后算的运算法则：\n我们可以把整个 **$\\text{☆} \\div 8$** 看作一个整体（也就是减数）。\n\n## 【第二步：求出被看作整体的减数部分】\n已知：$$\\text{被减数} - \\text{减数} = \\text{差}$$\n所以：$$\\text{减数} = \\text{被减数} - \\text{差}$$\n\n我们将对应的数值代入进行计算：\n$$\\text{☆} \\div 8 = 48 - 40$$\n$$\\text{☆} \\div 8 = 8$$\n\n## 【第三步：求出 ☆ 的值】\n已知：$$\\text{被除数} \\div \\text{除数} = \\text{商}$$\n所以：$$\\text{被除数} = \\text{商} \\times \\text{除数}$$\n\n也就是：\n$$\\text{☆} = 8 \\times 8$$\n$$\\text{☆} = 64$$\n\n## 【第四步：代入原式验算】\n我们将求出的 $\\text{☆} = 64$ 代入原式中进行检验：\n- 左边：$48 - 64 \\div 8 = 48 - 8 = 40$\n- 右边：$40$\n- 左右两边完美相等，证明计算答案完全正确！\n\n## 【结论】\n**☆ = 64**。",
          },
        ],
      };
      updatedProblems.push(initialProblem17);
      needsUpdate = true;
    }

    if (!hasSeed18) {
      // Remove any old seed 18 versions to avoid duplicates
      updatedProblems = updatedProblems.filter(
        (p) => p.id !== "seed-problem-18-v1" && p.title !== "6月10日星级挑战"
      );
      const initialProblem18: MathProblem = {
        id: seed18Id,
        date: "2026-06-10",
        title: "6月10日星级挑战",
        unlockTime: "14:00",
        createdAt: Date.now() + 17000,
        problems: [
          {
            id: "sub-18-1",
            content: "## **几何直观与证明 (3星)**\n\n### 右图中，已知 **$$\\angle 1 = \\angle \\text{B}$$**，那么 **$$\\angle 2$$** 一定等于 **$$\\angle \\text{C}$$**。\n\n### 请有理有据地说明 **$$\\angle 2 = \\angle \\text{C}$$** 的理由。",
            imageUrl: GEOMETRY_PROOF_IMAGE,
            difficulty: 3,
            solution: "## 【第一步：分析已知条件，转化平行关系】\n观察右图中的位置关系：\n- 线段 $AB$ 和 $AC$ 可以看作是被其他直线截得的截线。\n- 角和直线的位置为：\n  - $\\angle 1$ (即 $\\angle ADE$) 与 $\\angle \\text{B}$ (即 $\\angle ABC$) 是直线 $DE$ 与 $BC$ 被直线 $AB$ 所截形成的**同位角**。\n\n根据题目给出的条件：\n$$\\angle 1 = \\angle \\text{B}$$\n\n利用平行线的判定定理：\n> **同位角相等，两直线平行**。\n\n我们可以得出结论：\n**$$DE \\parallel BC$$**（也就是说，直线 $DE$ 平行于直线 $BC$）\n\n## 【第二步：运用平行线性质，证明结论】\n我们已经推理出了 $DE$ 平行于 $BC$。现在以直线 $AC$ 作为截线来看：\n- $\\angle 2$ (即 $\\angle AED$) 与 $\\angle \\text{C}$ (即 $\\angle ACB$) 是直线 $DE$ 与 $BC$ 被直线 $AC$ 所截形成的**同位角**。\n\n根据平行线的性质定理：\n> **两直线平行，同位角相等**。\n\n既然直线 $DE \\parallel BC$，那么它们的同位角必然相等，即：\n$$\\angle 2 = \\angle \\text{C}$$\n\n## 【第三步：总结规范推导步骤】\n我们可以将以上证明步骤整理为：\n1. 因为 $\\angle 1 = \\angle \\text{B}$ （已知）\n2. 所以 $DE \\parallel BC$ （同位角相等，两直线平行）\n3. 所以 $\\angle 2 = \\angle \\text{C}$ （两直线平行，同位角相等）\n\n这就是 $\\angle 2 = \\angle \\text{C}$ 的完整证明依据。\n\n## 【结论】\n证明成立，$\\angle 2$ 一定等于 $\\angle \\text{C}$。",
          },
        ],
      };
      updatedProblems.push(initialProblem18);
      needsUpdate = true;
    }

    if (!hasSeed19) {
      // Remove any old seed 19 versions to avoid duplicates
      updatedProblems = updatedProblems.filter(
        (p) => p.id !== "seed-problem-19-v1" && p.title !== "6月16日星级挑战"
      );
      const initialProblem19: MathProblem = {
        id: seed19Id,
        date: "2026-06-16",
        title: "6月16日星级挑战",
        unlockTime: "14:00",
        createdAt: Date.now() + 18000,
        problems: [
          {
            id: "sub-19-1",
            content: "## **几何与外角和定理 (3星)**\n\n### 在下图中，计算 **$$\\angle 1 + \\angle 2 + \\angle 3 + \\angle 4$$** 的度数和。\n\n### 问：**$$\\angle 1 + \\angle 2 + \\angle 3 + \\angle 4 = $$（       ）$$^\\circ$$**",
            imageUrl: QUADRILATERAL_OUTER_ANGLES_IMAGE,
            difficulty: 3,
            solution: "## 【第一步：认识平面四边形的外角关系】\n观察右侧的几何图形，这是一个**凸四边形**（也就是有 4 条边、4 个顶点的闭合图形）：\n- 我们看到，在四边形的每个顶点处都将一条边进行了延长：\n  - $\\angle 1$ 是第一个标记的外角；\n  - $\\angle 2$ 是第二个标记的外角；\n  - $\\angle 3$ 是第三个标记的外角；\n  - $\\angle 4$ 是第四个标记的外角。\n- 这 4 个角刚好构成了这个四边形的一组 **外角**（即在每个顶点处各取一个外角）。\n\n---\n\n## 【第二步：应用“多边形外角和定理”】\n在小学与初中几何中，有一个非常经典且重要的几何常识：\n> **任意凸多边形的外角和都恒等于 $$360^\\circ$$**（无论这个多边形是有 3 条边、4 条边还是更多的边）。\n\n既然该图形是一个 4 边形，那么它的 4 个外角之和必为 $$360^\\circ$$：\n$$\\angle 1 + \\angle 2 + \\angle 3 + \\angle 4 = 360^\\circ$$\n\n---\n\n## 【第三步：利用内角和进行严密推导】\n为了确保人人都能理解，我们可以利用大家最熟悉的**“四边形内角和是 $$360^\\circ$$”**来进行计算推导：\n\n1. **四边形内角和：**\n   设这个四边形的 4 个内角分别为 $\\angle A, \\angle B, \\angle C, \\angle D$，因为是四边形，它们的和是：\n   $$\\angle A + \\angle B + \\angle C + \\angle D = (4 - 2) \\times 180^\\circ = 360^\\circ$$\n\n2. **相邻内角与外角的关系：**\n   每个顶点上的外角与它的内角拼在一起刚好是一条直线（平角为 $$180^\\circ$$）：\n   - $$\\angle 1 + \\angle A = 180^\\circ$$\n   - $$\\angle 2 + \\angle B = 180^\\circ$$\n   - $$\\angle 3 + \\angle C = 180^\\circ$$\n   - $$\\angle 4 + \\angle D = 180^\\circ$$\n\n3. **全部加在一起：**\n   将以上 4 个等式两边分别相加，得到：\n   $$(\\angle 1 + \\angle 2 + \\angle 3 + \\angle 4) + (\\angle A + \\angle B + \\angle C + \\angle D) = 180^\\circ \\times 4 = 720^\\circ$$\n\n4. **代入求值：**\n   因为我们已经知道 $$\\angle A + \\angle B + \\angle C + \\angle D = 360^\\circ$$，将其代入上式中：\n   $$(\\angle 1 + \\angle 2 + \\angle 3 + \\angle 4) + 360^\\circ = 720^\\circ$$\n   $$(\\angle 1 + \\angle 2 + \\angle 3 + \\angle 4) = 720^\\circ - 360^\\circ = 360^\\circ$$\n\n所以，无论是使用定理还是手动推导，结果都完全一致！\n\n---\n\n## 【结论】\n**$$360$$**。",
          },
        ],
      };
      updatedProblems.push(initialProblem19);
      needsUpdate = true;
    }

    if (!hasSeed12) {
      const initialProblem12: MathProblem = {
        id: seed12Id,
        date: "2026-05-12",
        title: "5/12星级挑战",
        unlockTime: "14:00",
        createdAt: Date.now() + 11000,
        problems: [
          {
            id: "sub-12-1",
            content: "（1）甲、乙两数的和是616，如果把甲数的小数点向右移动一位，那么得到的数与乙数相等。甲数是（       ），乙数是（          ）。",
            difficulty: 3,
            solution: `## 【第一步：分析小数点移动规律】\n当一个小数的小数点向右移动一位时，这个数就扩大到原来的 **10 倍**。\n根据题意，把甲数的小数点向右移动一位后得到的数与乙数相等，说明：\n**乙数 = 甲数 × 10**\n\n## 【第二步：建立等量关系】\n已知甲乙两数的和是 616，我们可以用代数的方法来表示：\n设甲数为 $x$，则乙数为 $10x$。\n$x + 10x = 616$\n\n## 【第三步：求解方程】\n$11x = 616$\n$x = 616 \\div 11$\n$x = 56$\n\n既然甲数 $x = 56$，那么乙数就是：\n$56 \\times 10 = 560$\n\n## 【第四步：验证结果】\n$56 + 560 = 616$（符合和为 616 的条件）\n\n## 【结论】\n甲数是 **56**，乙数是 **560**。`,
          },
          {
            id: "sub-12-2",
            content:
              "（2）甲比乙小1512，如果把甲数的小数点向右移动一位，那么得到的数与乙数相等。甲、乙两数的和是（          ）。",
            difficulty: 3,
            solution: `## 【第一步：分析数值关系】\n同样地，把甲数的小数点向右移动一位后得到的数与乙数相等，意味着：\n**乙数是甲数的 10 倍**。\n\n## 【第二步：建立等量关系】\n已知“甲比乙小 1512”，即：\n**乙数 - 甲数 = 1512**\n\n设甲数为 $x$，则乙数为 $10x$：\n$10x - x = 1512$\n\n## 【第三步：求解甲数和乙数】\n$9x = 1512$\n$x = 1512 \\div 9$\n$x = 168$\n\n既然甲数是 **168**，那么乙数是：\n$168 \\times 10 = 1680$\n\n## 【第四步：求和】\n题目要求的是甲、乙两数的和：\n$168 + 1680 = 1848$\n\n## 【结论】\n甲、乙两数的和是 **1848**。`,
          },
        ],
      };
      updatedProblems.push(initialProblem12);
      needsUpdate = true;
    }

    if (!hasSeed13) {
      const initialProblem13: MathProblem = {
        id: seed13Id,
        date: "2026-05-19",
        title: "5月19日星级挑战",
        unlockTime: "14:00",
        createdAt: Date.now() + 12000,
        problems: [
          {
            id: "sub-13-1",
            content: `### 竖式谜\n\n下面的竖式中，不同的汉字代表不同的数字，相同的汉字代表相同的数字。你能算出这些汉字各代表什么数字吗？（汉字都不代表 0）\n\n\`\`\`text\n      爱 数 学\n-     爱 数 . 学\n----------------\n    爱 爱 数 . 学\n\`\`\``,
            difficulty: 3,
            solution: `## 【第一步：字母化建模】\n设“爱”为 $A$，“数”为 $B$，“学”为 $C$。\n根据题意，$A, B, C$ 是 1 到 9 之间互不相同的数字。\n\n竖式可以转化为等式：\n$(100A + 10B + C) - (10A + B + 0.1C) = 100A + 10A + B + 0.1C$\n\n## 【第二步：化简等式】\n将等式左边展开并合并同类项：\n$90A + 9B + 0.9C = 110A + B + 0.1C$\n\n将含 $A$ 的项移到一边，含 $B, C$ 的项移到另一边：\n$8B + 0.8C = 110A - 90A$\n$8B + 0.8C = 20A$\n\n两边同时乘以 10：\n$80B + 8C = 200A$\n\n同时除以 8：\n$10B + C = 25A$\n\n## 【第三步：讨论寻找答案】\n因为 $B, C$ 是 1 到 9 的数字，所以 $10B + C$ 的取值范围是 $11$ 到 $99$。\n\n1. 如果 $A = 1$：\n   $10B + C = 25 \\times 1 = 25$\n   得到 $B = 2, C = 5$。\n   验证：$A, B, C$ 分别为 $1, 2, 5$，互不相同且不为 0。符合条件。\n   计算验证：$125 - 12.5 = 112.5$。\n\n2. 如果 $A = 2$：\n   $10B + C = 25 \\times 2 = 50$\n   得到 $B = 5, C = 0$。\n   不符合“汉字都不代表 0”的条件。\n\n3. 如果 $A = 3$：\n   $10B + C = 25 \\times 3 = 75$\n   得到 $B = 7, C = 5$。\n   验证：$A, B, C$ 分别为 $3, 7, 5$，互不相同且不为 0。符合条件。\n   计算验证：$375 - 37.5 = 337.5$。\n\n4. 如果 $A \ge 4$：\n   $10B + C \ge 100$，这对于两位数 $10B+C$ 来说是不可能的。\n\n## 【结论】\n答案有两组（均为 1, 2, 5 或 3, 7, 5）：\n- 爱 = 1，数 = 2，学 = 5\n- 爱 = 3，数 = 7，学 = 5`,
          },
        ],
      };
      updatedProblems.push(initialProblem13);
      needsUpdate = true;
    }

    if (!hasSeed14) {
      const initialProblem14: MathProblem = {
        id: seed14Id,
        date: "2026-05-20",
        title: "5月20日星级挑战",
        unlockTime: "14:00",
        createdAt: Date.now() + 13000,
        problems: [
          {
            id: "sub-14-1",
            content: "### 第一题：简便运算\n\n**60.5 + 60.7 + 59.8 + 61.1 + 60.8 + 58.8**",
            difficulty: 2,
            solution: "## 【第一步：分析特征】\n观察这些数，发现它们都非常接近 **60**。因此，我们可以选择 60 作为基准数。\n\n## 【第二步：基准数法计算】\n我们可以把每一个数都拆成 $60 +$ 或 $60 -$ 的形式：\n- $60.5 = 60 + 0.5$\n- $60.7 = 60 + 0.7$\n- $59.8 = 60 - 0.2$\n- $61.1 = 60 + 1.1$\n- $60.8 = 60 + 0.8$\n- $58.8 = 60 - 1.2$\n\n## 【第三步：合并计算】\n$60 \\times 6 + (0.5 + 0.7 - 0.2 + 1.1 + 0.8 - 1.2)$\n$= 360 + (1.2 - 0.2 + 1.1 + 0.8 - 1.2)$\n$= 360 + (1 + 1.9 - 1.2)$\n$= 360 + (2.9 - 1.2)$\n$= 360 + 1.7$\n$= 361.7$\n\n## 【结论】\n原式结果为 **361.7**。",
          },
          {
            id: "sub-14-2",
            content:
              "### 第二题：应用题\n\n**妈妈买来一桶油，连桶重 5.2kg，用去一半油后，连桶重 2.7kg，这桶油原来重多少千克？桶重多少千克？**",
            difficulty: 2,
            solution: "## 【第一步：分析总量变化】\n- **连桶原重**：$5.2\\text{ kg}$\n- **剩余连桶重**：$2.7\\text{ kg}$\n\n## 【第二步：求出一半油的重量】\n因为用去的是一半的油，所以减少的重量就是一半油的重量：\n$5.2 - 2.7 = 2.5\\text{ kg}$\n\n## 【第三步：求出原来油的总重】\n原来的油重是一半油重的 2 倍：\n$2.5 \\times 2 = 5\\text{ kg}$\n\n## 【第四步：求出桶的重量】\n用原来的总重量（油 + 桶）减去油的重量：\n$5.2 - 5 = 0.2\\text{ kg}$\n\n## 【结论】\n这桶油原来重 **5kg**，桶重 **0.2kg**。",
          },
        ],
      };
      updatedProblems.push(initialProblem14);
      needsUpdate = true;
    }

    if (!hasSeed15) {
      // Remove any old seed 15 versions to avoid duplicates
      updatedProblems = updatedProblems.filter(
        (p) => p.id !== "seed-problem-15-v1" && p.title !== "5月26日星级挑战"
      );
      const initialProblem15: MathProblem = {
        id: seed15Id,
        date: "2026-05-26",
        title: "5月26日星级挑战",
        unlockTime: "14:00",
        createdAt: Date.now() + 14000,
        problems: [
          {
            id: "sub-15-1",
            content: "## **第一题：图形的轴对称 (3星)**\n\n### 在下面的 3x3 图形中，再给 **1 个** 小方格涂上颜色，使涂色部分成为一个轴对称图形，一共有多少种不同的涂法？",
            imageUrl: AXISYMMETRIC_3X3_IMAGE,
            difficulty: 3,
            solution: "## 【第一步：分析已有图形的对称性】\n观察给出的 3×3 网络图，已有 3 个蓝色格子。设行号为 1~3（从上到下），列号为 1~3（从左到右）：\n- 已二倍色位置：(1,1)，(2,2)，(3,1)\n- 该图形本身已经关于**水平中线**对称：(1,1) 与 (3,1) 互为对称点，(2,2) 位于中线上。\n\n## 【第二步：寻找新增 1 个格子使其轴对称的方案】\n轴对称图形的对称轴可以是：水平中线、垂直中线、主对角线、副对角线。我们分别尝试：\n\n1. **保持关于“水平中线”对称：**\n   新增的一个格子也必须落在线对称点上，或者自身位于对称轴上。\n   - 位于水平中在线的未涂色格子有：(2,1) 和 (2,3)。\n   - 如果涂色 **(2,1)**：图形具有水平对称轴（行1与行3对称，行2内部对称）。符合条件！\n   - 如果涂色 **(2,3)**：图形具有水平对称轴。符合条件！\n\n2. **使图形关于“主对角线（左上到右下）”对称：**\n   - 已有格子 (1,1) 和 (2,2) 已经在对角线上，只需让 (3,1) 的对称点 (1,3) 也被涂色。\n   - 如果涂色 **(1,3)**：整个图形将关于主对角线完美对称。符合条件！\n\n3. **使图形关于“副对角线（右上到左下）”对称：**\n   - 已有格子 (3,1) 和 (2,2) 已经在对角线上，只需让 (1,1) 的对称点 (3,3) 也被涂色。\n   - 如果涂色 **(3,3)**：整个图形将关于副对角线完美对称。符合条件！\n\n## 【结论】\n一共有 **4** 种不同的涂法，分别涂在以下网格位置：\n1. 第二行第一列 (2,1)\n2. 第二行第三列 (2,3)\n3. 第一行第三列 (1,3)\n4. 第三行第三列 (3,3)",
          },
          {
            id: "sub-15-2",
            content: "## **第二题：几何直观 - 轴对称 (3星)**\n\n### 在如图所示的图形中，再给 **2 个** 格子涂上颜色，使涂色部分成为一个轴对称图形。一共有多少种不同的涂法？",
            imageUrl: AXISYMMETRIC_3X4_IMAGE,
            difficulty: 3,
            solution: "## 【第一步：分析已有图形的特征】\n该图形是一个 3 列 4 行的矩形网络，已有 4 个蓝色格子，全部位于**中间第二列**（全满）。\n- 这说明现有的蓝色部分已经是针对垂直轴和水平轴完全对称的。\n- 我们现在要再选取 **2 个** 白色格子涂色，使最终完整的涂色部分构成一个轴对称图形。\n\n## 【第二步：确定可能存在的对称轴】\n由于这是一个非正方形的 3×4 矩形，其可能的对称轴只有两条：\n1. **垂直中线 (纵向对称轴)** —— 穿过第2列的中心。\n2. **水平中线 (横向对称轴)** —— 穿过第2行与第3行之间的中线。\n\n## 【第三步：讨论这两种对称方式下的独立涂法】\n\n### 情况 A：关于“垂直中线”对称\n要把 2 个新增格子涂色，使它们关于垂直中轴线对称。由于第二列已经全满，我们只能选择第一列和第三列中的格子，并且必须成对选择：一对关于一列对称的格子 is $(Row, 1)$ and $(Row, 3)$。\n- 行1可以选：(1,1) 和 (1,3)\n- 行2可以选：(2,1) 和 (2,3)\n- 行3可以选：(3,1) 和 (3,3)\n- 行4可以选：(4,1) 和 (4,3)\n\n这共有 **4** 种不同的两格涂法。每一组都可以保证图形具有纵向轴对称性。\n\n### 情况 B：关于“水平中线”对称\n要把 2 个新增格子涂色，使它们关于中间的横向中线对称。每一列需要两两对称：\n- 第一列关于横向中轴对称的配对有：\n  - 第一组：(1,1) 和 (4,1)\n  - 第二组：(2,1) 和 (3,1)\n- 第三列关于横向中轴对称的配对有：\n  - 第三组：(1,3) 和 (4,3)\n  - 第四组：(2,3) 和 (3,3)\n\n这共有 **4** 种不同的两格涂法（第一列2个或第三列2个）。每一组都可以保证图形具有横向轴对称性。\n\n## 【第四步：检查冲突与去重】\n情况 A 的 4 种方案均在**同一行**内选格（两个格子横向对称分布于中间列的两侧）。\n情况 B 的 4 种方案均在**同一列**内选格（两个格子纵向对称分布于水平中心线的两侧，同在第一列或同在第三列）。\n由于选择的方格集合没有任何交叉重合，所以这两类情况是完全独立的，没有重复计算的组合。\n\n## 【结论】\n一共有 $4 + 4 = 8$ 种不同的涂法。 (选项中选择 **A. 8**)",
          },
        ],
      };
      updatedProblems.push(initialProblem15);
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
                          <div className="mb-4 flex">
                            <img
                              src={prob.imageUrl}
                              alt={`题目 ${index + 1} 图片`}
                              className="max-h-36 w-auto object-contain rounded-lg"
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
