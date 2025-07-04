// This page allows anyone to add resources to the Supabase DB (no login required)
"use client";
import React, { useState, useEffect } from 'react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function ContributorUploadResource() {
  const [supabaseClient, setSupabaseClient] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(null);

  const [title, setTitle] = useState('');
  const [unitChapter, setUnitChapter] = useState('');
  const [link, setLink] = useState('');
  const [description, setDescription] = useState('');
  const [resourceType, setResourceType] = useState('note');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  const resourceCategories = [
    { value: 'note', label: 'Note' },
    { value: 'topic_question', label: 'Topic Questions' },
    { value: 'solved_papers', label: 'Solved Past Paper Questions' },
  ];

  useEffect(() => {
    if (window.supabase && !supabaseClient) {
      const client = window.supabase.createClient(supabaseUrl, supabaseKey);
      setSupabaseClient(client);
    }
    // eslint-disable-next-line
  }, []);

  // Fetch subjects
  useEffect(() => {
    if (!supabaseClient) return;
    setLoadingSubjects(true);
    supabaseClient.from('subjects')
      .select('id, name, code, syllabus_type')
      .then(({ data, error }) => {
        if (error) {
          setMessage(`Subjects fetch failed: ${error.message}`);
          setMessageType('error');
        } else {
          setSubjects(data || []);
          if (data?.[0]?.id) setSelectedSubjectId(data[0].id);
        }
        setLoadingSubjects(false);
      });
  }, [supabaseClient]);

  // Resource upload handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !link || !selectedSubjectId || !resourceType) {
      setMessage("Fill all required fields");
      setMessageType('error');
      return;
    }
    if (!supabaseClient) {
      setMessage("Not ready to submit");
      setMessageType('error');
      return;
    }
  
    const unitValue = unitChapter.trim() === '' ? 'General' : unitChapter.trim();
  
    const { error } = await supabaseClient
      .from('community_resource_requests')
      .insert({
        contributor_name: "Anonymous Contributor", // You can make this dynamic
        contributor_email: "anonymous@example.com", // Optional input field can be added
        title,
        link,
        description,
        resource_type: resourceType,
        subject_id: selectedSubjectId,
        unit_chapter_name: unitValue,
        is_approved: false,
        submitter_ip: null, // can be handled via Supabase Edge Functions if needed
      });
  
    if (error) {
      setMessage(`Submission failed: ${error.message}`);
      setMessageType('error');
    } else {
      setMessage("✅ Resource request submitted for review");
      setMessageType('success');
      setTitle(''); setLink(''); setDescription(''); setUnitChapter('');
    }
  };

  return (
    <div className="min-h-screen bg-blue-100 flex items-center justify-center p-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8 space-y-6 tracking-[-0.025em]">
        <h2 className="text-2xl font-semibold text-gray-800 text-center">Contribute with new Resource</h2>

        {message && (
          <div className={`p-3 rounded-md text-sm ${
            messageType === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
            'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title *</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="e.g., Physics Chapter 1 Notes"
              required
            />
          </div>
          <div>
            <label htmlFor="unitChapter" className="block text-sm font-medium text-gray-700">
              Unit/Chapter Name (Optional)
            </label>
            <input
              type="text"
              id="unitChapter"
              value={unitChapter}
              onChange={(e) => setUnitChapter(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="e.g., Unit 1: Kinematics"
            />
            <p className="text-xs text-gray-500 mt-1">Leave blank if it applies to the whole subject (will be marked as "General")</p>
          </div>
          <div>
            <label htmlFor="link" className="block text-sm font-medium text-gray-700">Resource Link (URL) *</label>
            <input
              type="url"
              id="link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="e.g., https://docs.google.com/..."
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description (Optional)</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-y"
              placeholder="A brief summary of the resource content."
            ></textarea>
          </div>
          <div>
            <label htmlFor="resourceType" className="block text-sm font-medium text-gray-700">Resource Type *</label>
            <select
              id="resourceType"
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            >
              {resourceCategories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject *</label>
            <select
              id="subject"
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
              disabled={loadingSubjects || subjects.length === 0}
            >
              {loadingSubjects ? (
                <option>Loading subjects...</option>
              ) : (
                subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code}) - {subject.syllabus_type}
                  </option>
                ))
              )}
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
            disabled={loadingSubjects || subjects.length === 0}
          >
            Submit Resource
          </button>
        </form>
      </div>
    </div>
  );
}
