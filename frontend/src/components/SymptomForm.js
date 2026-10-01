import React, { useState } from "react";
import axios from "../services/api";

export default function SymptomForm({ token, setResult }) {
  const [symptoms, setSymptoms] = useState("");

  const predict = async () => {
    const res = await axios.post("/predict", { symptoms }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setResult(res.data);
  };

  return (
    <div>
      <h3>Enter Symptoms</h3>
      <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)} />
      <button onClick={predict}>Predict</button>
    </div>
  );
}
