import { createRoute, type AnyRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { SettingsPanelComponent, getGradient } from "./settingsPanel";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";

type UserAffirmation = {
  _id: string;
  text: string;
  userId: string;
  createdAt: string;
};

export default (parent: AnyRoute) => createRoute({
  path: '/affirmation',
  getParentRoute: () => parent,
  component: AffirmationPage,
})

function AffirmationPage() {
  const [affirmation, setAffirmation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newAffirmation, setNewAffirmation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [gradient, setGradient] = useState(getGradient());
  const { token } = useAuth();
  const [isAILoading, setIsAILoading] = useState(false);
  
  // User's own affirmations
  const [myAffirmations, setMyAffirmations] = useState<UserAffirmation[]>([]);
  const [showMyAffirmations, setShowMyAffirmations] = useState(false);
  const [isLoadingMy, setIsLoadingMy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  // Listen for settings changes
  useEffect(() => {
    const handleSettingsChange = () => {
      setGradient(getGradient());
    };
    window.addEventListener('settingsChanged', handleSettingsChange);
    return () => window.removeEventListener('settingsChanged', handleSettingsChange);
  }, []);

  // Fetch user's own affirmations
  const fetchMyAffirmations = async () => {
    setIsLoadingMy(true);
    try {
      const response = await fetch('http://localhost:3001/api/affirmations/my', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMyAffirmations(data);
      }
    } catch (error) {
      console.error('Error fetching my affirmations', error);
    } finally {
      setIsLoadingMy(false);
    }
  };

  // Load user affirmations when panel is opened
  useEffect(() => {
    if (showMyAffirmations && token) {
      fetchMyAffirmations();
    }
  }, [showMyAffirmations, token]);

  // Handle delete affirmation
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/affirmations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setMyAffirmations(prev => prev.filter(a => a._id !== id));
      }
    } catch (error) {
      console.error('Error deleting affirmation', error);
    }
  };

  // Handle update affirmation
  const handleUpdate = async (id: string) => {
    if (!editText.trim()) return;
    try {
      const response = await fetch(`http://localhost:3001/api/affirmations/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ text: editText })
      });
      if (response.ok) {
        setMyAffirmations(prev => prev.map(a => 
          a._id === id ? { ...a, text: editText } : a
        ));
        setEditingId(null);
        setEditText("");
      }
    } catch (error) {
      console.error('Error updating affirmation', error);
    }
  };

  const handleSubmitAffirmation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newAffirmation.trim()) return;
    setIsSubmitting(true);
    setSubmitMessage("");
    try {
      const response = await fetch('http://localhost:3001/api/affirmations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: newAffirmation })
      });
      if (response.ok) {
        setSubmitMessage("Affirmation added successfully!");
        setNewAffirmation("");
        setTimeout(() => setSubmitMessage(""), 3000);
        // Refresh list if viewing my affirmations
        if (showMyAffirmations) {
          fetchMyAffirmations();
        }
      } else {
        const errorData = await response.json();
        setSubmitMessage(errorData.message || "Failed to add affirmation");
      }
    } catch (error) {
      console.error('Error adding affirmation', error);
      setSubmitMessage("Something went wrong, could not add your affirmation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAffirmationClick = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/affirmations/random');     
       if (!response.ok) {
        throw new Error('System error, failed to fetch affirmation');
      }
      const data = await response.json();
      await new Promise(resolve => setTimeout(resolve, 2000));
      setAffirmation(data.text);
    } catch (error) {
      console.error('Error getting affirmation', error);
      setAffirmation('Oops! Something went wrong, could not load your affirmation');
    } finally {
      setIsLoading(false);
    }
    };

    const handleAIAffirmationClick = async () => {
      setIsAILoading(true);
      try {
        const response = await fetch('http://localhost:3001/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category: 'motivation', mood: 'positive' })
        });
        const data = await response.json();
        setAffirmation(data.text || 'AI returned no text');
      } catch (error) {
        console.error('AI Error:', error);
        setAffirmation('AI is unavailable. Make sure Ollama is running!');
      } finally {
        setIsAILoading(false);
      }
    };
 
 
    return (
    <ProtectedRoute>
        <div className={`flex flex-col gap-4 min-h-screen bg-gradient-to-br ${gradient} text-white flex flex-col items-center justify-center p-5`}>
          <SettingsPanelComponent />
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-shadow-lg">
            Your Personal Affirmation App
          </h1>
          <p className="text-xl mb-8 text-center opacity-90">
            Click the button when you need some love and motivation
          </p>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 md:p-12 max-w-2xl w-full border border-white/20 shadow-xl mb-8 min-h-[200px] flex items-center justify-center">
            {isLoading ? (
              <div className="text-2xl animate-pulse">Loading your special message</div>
            ) : (
              <p className="text-2xl md:text-3xl font-medium text-center leading-relaxed">
                {affirmation || "Ready for your first affirmation?"}
              </p>
            )}
          </div>
    
          <button 
            className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white text-xl font-semibold py-4 px-12 rounded-full shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            onClick={handleAffirmationClick}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Motivate Me!"}
          </button>

          {/* Add Your Own Affirmation Button */}
          <button 
            onClick={handleAIAffirmationClick} 
            disabled={isAILoading}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white text-xl font-semibold py-4 px-12 rounded-full shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isAILoading ? "Your personal AI is reading your mood..." : "Let your AI generate an affirmation for you"}
          </button>

          {/* Add Your Own Affirmation Button */}
          <button 
            onClick={() => setShowForm(!showForm)} 
            className="text-white/80 hover:text-white text-sm underline"
          >
            {showForm ? "Hide form" : "Add Your Own Affirmation"}
          </button>
          
          {showForm && (
            <form onSubmit={handleSubmitAffirmation} className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-xl p-4">
              <div className="mb-4">
                <label htmlFor="newAffirmation" className="block text-sm font-medium text-white">New Affirmation</label>
                <input 
                  type="text" 
                  id="newAffirmation" 
                  value={newAffirmation} 
                  onChange={(e) => setNewAffirmation(e.target.value)} 
                  className="mt-1 block w-full rounded-md bg-white/10 border-white/20 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/30" 
                />
              </div>
              <button 
                type="submit" 
                className="w-full py-2 px-4 rounded-md bg-white text-pink-600 font-medium hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Adding..." : "Add Affirmation"}
              </button>
            </form>
          )}
          {submitMessage && <p className="text-green-500 text-sm mt-2">{submitMessage}</p>}

          {/* View My Affirmations Button */}
          <button 
            onClick={() => setShowMyAffirmations(!showMyAffirmations)} 
            className="mt-4 text-white/80 hover:text-white text-sm underline"
          >
            {showMyAffirmations ? "Hide My Affirmations" : "View My Affirmations"}
          </button>

          {/* My Affirmations Panel */}
          {showMyAffirmations && (
            <div className="w-full max-w-2xl mt-4 bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4">My Affirmations</h3>
              {isLoadingMy ? (
                <p className="text-white/70">Loading your affirmations...</p>
              ) : myAffirmations.length === 0 ? (
                <p className="text-white/70">You haven't added any affirmations yet. Add one above!</p>
              ) : (
                <ul className="space-y-3">
                  {myAffirmations.map((aff) => (
                    <li key={aff._id} className="bg-white/10 rounded-lg p-4 flex flex-col gap-2">
                      {editingId === aff._id ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="flex-1 rounded-md bg-white/10 border-white/20 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/30"
                          />
                          <button
                            onClick={() => handleUpdate(aff._id)}
                            className="px-3 py-1 bg-green-500 hover:bg-green-600 rounded-md text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => { setEditingId(null); setEditText(""); }}
                            className="px-3 py-1 bg-gray-500 hover:bg-gray-600 rounded-md text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <p className="text-white">{aff.text}</p>
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => { setEditingId(aff._id); setEditText(aff.text); }}
                              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded-md text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(aff._id)}
                              className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded-md text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </ProtectedRoute>
  );
}
