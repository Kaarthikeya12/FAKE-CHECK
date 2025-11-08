"use client";

import { useEffect, useState } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";

export default function TestPage() {
  const [input, setInput] = useState("");
  const [data, setData] = useState<string[]>([]);

  // Write data to Firestore
  const handleAdd = async () => {
    if (!input.trim()) return;
    await addDoc(collection(db, "testNews"), {
      text: input,
      createdAt: new Date().toISOString(),
    });
    setInput("");
    loadData(); // refresh data after writing
  };

  // Read data from Firestore
  const loadData = async () => {
    const snapshot = await getDocs(collection(db, "testNews"));
    const list = snapshot.docs.map((doc) => doc.data().text as string);
    setData(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Firestore Test Page</h1>

      <div className="flex gap-2 mb-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text"
          className="border p-2 rounded w-full"
        />
        <button
          onClick={handleAdd}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      <ul className="border rounded p-4 bg-gray-50">
        {data.map((item, i) => (
          <li key={i} className="border-b py-2">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
