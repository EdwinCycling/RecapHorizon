import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const addTestPrompts = async () => {
  try {
    const promptsCollection = collection(db, 'prompts');
    
    // Test prompt 1: Innovatie Brainstorm
    await addDoc(promptsCollection, {
      title: "Innovatie Brainstorm",
      prompt_text: "Genereer 5 radicale innovatie-ideeën gebaseerd op de problemen en behoeften die in deze transcriptie worden genoemd. Denk buiten de gebaande paden.",
      requires_topic: false,
      is_active: true,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      language: "nl"
    });
    
    // Test prompt 2: Project Risico Overzicht
    await addDoc(promptsCollection, {
      title: "Project Risico Overzicht",
      prompt_text: "Analyseer de discussie rondom dit onderwerp en identificeer de top 3 meest kritieke risico's voor de succesvolle afronding. Geef per risico ook een korte mitigatiestrategie.",
      requires_topic: true,
      is_active: true,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      language: "nl"
    });
    
    console.log('Test prompts successfully added to Firestore!');
    return true;
  } catch (error) {
    console.error('Error adding test prompts:', error);
    return false;
  }
};