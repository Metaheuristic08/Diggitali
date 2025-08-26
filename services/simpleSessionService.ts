import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";
import type { Question, TestSession } from "@/types";

/*
  Sistema simplificado de gestión de sesiones:
  - UNA sesión activa por user/competence/level mientras no tenga endTime.
  - Si existe una completada y el usuario entra de nuevo, se crea NUEVA sesión (reinicio) sólo si desea repetir (no requerido para flujo obligatorio).
  - Cache local en sessionStorage para resiliencia en refrescos rápidos antes de que Firestore responda.
  - Criterio de 'completed': passed === true (>=2 correctas) o score === 100. Se guarda endTime.
*/

// Cache local eliminado para forzar siempre lectura en tiempo real de Firestore.

export interface ActiveSessionResult {
  session: TestSession;
  wasCreated: boolean;
  fromCache: boolean;
  docId: string; // id Firestore
}

// makeLocalKey removido

export async function getOrCreateActiveSession(userId: string, competence: string, level: string, questions: Question[]): Promise<ActiveSessionResult> {
  if (!db) throw new Error("Firebase no inicializado");

  // Buscar sesión activa en Firestore (sin cache local)
  const q = query(
    collection(db, "testSessions"),
    where("userId", "==", userId),
    where("competence", "==", competence),
    where("level", "==", level)
  );
  const snap = await getDocs(q);
  const sessions: Array<{ id: string; data: TestSession }> = [];
  snap.forEach(d => sessions.push({ id: d.id, data: d.data() as TestSession }));

  // Elegir mejor sesión activa: sin endTime con más respuestas; si ninguna, la última completada (para evitar recrear si no corresponde hasta que usuario confirme repetir).
  const active = sessions
    .filter(s => !s.data.endTime)
    .sort((a, b) => (b.data.answers.filter(a1 => a1 !== null).length - a.data.answers.filter(a1 => a1 !== null).length))[0];

  if (active) {
    const merged: TestSession = { ...active.data, id: active.id, questions: questions, answers: active.data.answers.slice(0, questions.length) };
  return { session: merged, wasCreated: false, fromCache: false, docId: active.id };
  }

  // NO hay activa. Crear nueva SOLO si no existe completada para esta competencia todavía (flujo progresivo); si hay completada significaría que debe pasar a la siguiente competencia afuera de esta página.
  const anyCompleted = sessions.some(s => !!s.data.endTime && (s.data.passed || s.data.score === 100));
  if (anyCompleted) {
    // Retornar la última completada (para redirigir a resultados) - no crear nueva automáticamente.
    const lastCompleted = sessions.filter(s => s.data.endTime).sort((a, b) => new Date(b.data.endTime || b.data.startTime).getTime() - new Date(a.data.endTime || a.data.startTime).getTime())[0];
    const compSession: TestSession = { ...lastCompleted.data, id: lastCompleted.id };
  return { session: compSession, wasCreated: false, fromCache: false, docId: lastCompleted.id };
  }

  // Crear nueva
  const newSession: TestSession = {
    id: "",
    userId,
    competence,
    level,
    questions,
    answers: new Array(questions.length).fill(null),
    currentQuestionIndex: 0,
    startTime: new Date(),
    score: 0,
    passed: false
  };
  const ref = await addDoc(collection(db, "testSessions"), newSession);
  const withId = { ...newSession, id: ref.id };
  return { session: withId, wasCreated: true, fromCache: false, docId: ref.id };
}

export async function updateSessionAnswer(session: TestSession, questionIndex: number, answerIndex: number) {
  if (!db || !session.id) return;
  const answers = [...session.answers];
  answers[questionIndex] = answerIndex;
  await updateDoc(doc(db, "testSessions", session.id), {
    answers,
    currentQuestionIndex: questionIndex
  });
  const updated: TestSession = { ...session, answers, currentQuestionIndex: questionIndex };
  return updated;
}

export async function completeSession(session: TestSession, correctAnswers: number) {
  if (!db || !session.id) return session;
  const score = Math.round((correctAnswers / session.questions.length) * 100);
  const passed = correctAnswers >= 2;
  const endTime = new Date();
  await updateDoc(doc(db, "testSessions", session.id), { endTime, score, passed });
  const updated: TestSession = { ...session, endTime, score, passed };
  return updated;
}
// Funciones de cache local eliminadas
