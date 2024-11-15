import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Volume2, Calculator, Save, Folder, Download, Trash2, Search, Moon, Sun, Import } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';

const NoteApp = () => {
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState({ id: null, content: '', title: '', tags: [] });
  const [isListening, setIsListening] = useState(false);
  const [isCalcListening, setIsCalcListening] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [calculation, setCalculation] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const savedNotes = localStorage.getItem('notes');
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedNotes) setNotes(JSON.parse(savedNotes));
    if (savedDarkMode) setDarkMode(JSON.parse(savedDarkMode));

    if (savedNotes) {
      const cats = [...new Set(JSON.parse(savedNotes).flatMap(note => note.tags))];
      setCategories(cats);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    document.body.className = darkMode ? 'dark' : '';
  }, [notes, darkMode]);

  const playCustomVoice = useCallback((filePath) => {
    const audio = new Audio(filePath);
    audio.play().catch(err => setError('Failed to play audio: ' + err.message));
  }, []);

  const startListening = useCallback((isCalc = false) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => isCalc ? setIsCalcListening(true) : setIsListening(true);
    recognition.onend = () => isCalc ? setIsCalcListening(false) : setIsListening(false);
    recognition.onerror = (event) => setError(event.error);

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      if (isCalc) {
        const calcText = transcript
          .toLowerCase()
          .replace('plus', '+')
          .replace('minus', '-')
          .replace('times', '*')
          .replace('divided by', '/');
        setCalculation(calcText);
        calculate(calcText);
      } else {
        setCurrentNote(prev => ({
          ...prev,
          content: prev.content + ' ' + transcript
        }));
      }
    };

    recognition.start();
  }, []);

  const calculate = useCallback((calc = calculation) => {
    try {
      const evalResult = Function('"use strict";return (' + calc + ')')();
      setResult(evalResult.toString());
      playCustomVoice('C:/Users/richk/Downloads/note-taking-app/src/audio/voices/Shelby.ogg');
      setError('');
    } catch (err) {
      setError('Invalid calculation');
      playCustomVoice('C:/Users/richk/Downloads/note-taking-app/src/audio/voices/Shelby.ogg');
    }
  }, [calculation, playCustomVoice]);

  const saveNote = () => {
    if (!currentNote.title || !currentNote.content) {
      setError('Please add title and content');
      return;
    }

    if (currentNote.id) {
      setNotes(prev => prev.map(note => 
        note.id === currentNote.id ? { ...currentNote } : note
      ));
    } else {
      setNotes(prev => [...prev, { ...currentNote, id: Date.now() }]);
    }
    setCurrentNote({ id: null, content: '', title: '', tags: [] });
  };

  const deleteNote = (id) => {
    setNotes(prev => prev.filter(note => note.id !== id));
    if (currentNote.id === id) {
      setCurrentNote({ id: null, content: '', title: '', tags: [] });
    }
  };

  const exportNotes = () => {
    const exportData = notes.map(note => ({
      id: note.id,
      title: note.title,
      content: note.content,
      tags: note.tags
    }));
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notes_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    playCustomVoice('C:/Users/richk/Downloads/note-taking-app/src/audio/voices/Shelby.ogg');
  };

  const importNotes = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedNotes = JSON.parse(e.target.result);
          setNotes(prev => [...prev, ...importedNotes]);
        } catch (err) {
          setError('Invalid import file');
        }
      };
      reader.readAsText(file);
    }
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || note.tags.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={`max-w-4xl mx-auto space-y-4 p-4 ${darkMode ? 'dark:bg-gray-800 dark:text-white' : ''}`}>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Note Taking App</h1>
        <Button onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? <Sun className="mr-2" /> : <Moon className="mr-2" />}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Note Taking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentNote.title}
                  onChange={(e) => setCurrentNote(prev => ({ ...prev, title: e.target.value }))}
                  className="flex-1 p-2 border rounded dark:bg-gray-700"
                  placeholder="Note title..."
                />
                <input
                  type="text"
                  value={currentNote.tags.join(', ')}
                  onChange={(e) => setCurrentNote(prev => ({ 
                    ...prev, 
                    tags: e.target.value.split(',').map(tag => tag.trim()) 
                  }))}
                  className="flex-1 p-2 border rounded dark:bg-gray-700"
                  placeholder="Tags (comma separated)..."
                />
              </div>
              <textarea
                value={currentNote.content}
                onChange={(e) => setCurrentNote(prev => ({ ...prev, content: e.target.value }))}
                className="w-full min-h-32 p-2 border rounded dark:bg-gray-700"
                placeholder="Start typing or use speech-to-text..."
              />
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => startListening(false)} disabled={isListening}>
                  {isListening ? <MicOff className="mr-2" /> : <Mic className="mr-2" />}
                  {isListening ? 'Stop Listening' : 'Start Listening'}
                </Button>
                <Button onClick={() => playCustomVoice('C:/Users/richk/Downloads/note-taking-app/src/audio/voices/Shelby.ogg')}>
                  <Volume2 className="mr-2" />
                  Speak Note
                </Button>
                <Button onClick={saveNote}>
                  <Save className="mr-2" />
                  Save Note
                </Button>
                <Button onClick={exportNotes}>
                  <Download className="mr-2" />
                  Export Notes
                </Button>
                <input
                  type="file"
                  accept=".json"
                  onChange={importNotes}
                  className="hidden"
                  id="import-notes"
                />
                <Button onClick={() => document.getElementById('import-notes').click()}>
                  <Import className="mr-2" />
                  Import Notes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saved Notes</CardTitle>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 p-2 border rounded dark:bg-gray-700"
                placeholder="Search notes..."
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border rounded p-2 dark:bg-gray-700"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredNotes.map(note => (
                <div 
                  key={note.id} 
                  className="p-2 border rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <div className="flex justify-between items-start">
                    <div onClick={() => setCurrentNote(note)}>
                      <h3 className="font-semibold">{note.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{note.content}</p>
                      {note.tags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {note.tags.map(tag => (
                            <span key={tag} className="text-xs bg-gray-200 dark:bg-gray-600 rounded px-1">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => deleteNote(note.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Calculator</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <input
                type="text"
                value={calculation}
                onChange={(e) => setCalculation(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-700"
                placeholder="Enter calculation or speak..."
              />
              <div className="flex gap-2">
                <Button onClick={() => calculate()}>
                  <Calculator className="mr-2" />
                  Calculate
                </Button>
                <Button onClick={() => startListening(true)} disabled={isCalcListening}>
                  {isCalcListening ? <MicOff className="mr-2" /> : <Mic className="mr-2" />}
                  {isCalcListening ? 'Stop' : 'Speak'}
                </Button>
              </div>
              {result && (
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded">
                  Result: {result}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NoteApp;
