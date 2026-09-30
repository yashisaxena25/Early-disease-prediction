import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});

/* cd C:\disease_prediction\ml-service                                         
>> .\venv\Scripts\Activate.ps1                     
>> uvicorn main:app --reload  */   