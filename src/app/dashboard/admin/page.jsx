"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function AdminDashboard() {
  const [supabaseClient, setSupabaseClient] = useState(null);
  const [staffUser, setStaffUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [unitChapter, setUnitChapter] = useState('');
  const [link, setLink] = useState('');
  const [description, setDescription] = useState('');
  const [resourceType, setResourceType] = useState('note');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [staffUsername, setStaffUsername] = useState('');
  const [latestResources, setLatestResources] = useState([]);
  const [unapprovedResources, setUnapprovedResources] = useState([]);
  const [activeTab, setActiveTab] = useState('upload');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('');
  const [newSubjectType, setNewSubjectType] = useState('');
  const [editResource, setEditResource] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const resourceCategories = [
    { value: 'note', label: 'Note' },
    { value: 'topic_question', label: 'Topic Question' },
    { value: 'marking_scheme', label: 'Marking Scheme' },
    { value: 'extra_resource', label: 'Extra Resource' },
  ];

  useEffect(() => {
    if (window.supabase && !supabaseClient) {
      const client = window.supabase.createClient(supabaseUrl, supabaseKey);
      setSupabaseClient(client);
    }
  }, []);

  useEffect(() => {
    if (!supabaseClient) return;
    setIsAuthReady(false);
    const { data: subscription } = supabaseClient.auth.onAuthStateChange((_e, session) => {
      setStaffUser(session?.user || null);
      setIsAuthReady(true);
      if (session?.user) {
        supabaseClient.from('staff_users').select('username').eq('id', session.user.id).single().then(({ data: staffData }) => {
          setStaffUsername(staffData?.username || '');
        });
        fetchLatestResources();
        fetchUnapprovedResources();
      } else {
        setStaffUsername('');
      }
    });
    supabaseClient.auth.getSession().then(({ data }) => {
      setStaffUser(data?.session?.user || null);
      setIsAuthReady(true);
      if (data?.session?.user) {
        supabaseClient.from('staff_users').select('username').eq('id', data.session.user.id).single().then(({ data: staffData }) => {
          setStaffUsername(staffData?.username || '');
        });
        fetchLatestResources();
        fetchUnapprovedResources();
      } else {
        setStaffUsername('');
      }
    });
    return () => subscription?.unsubscribe?.();
  }, [supabaseClient]);

  useEffect(() => {
    if (!supabaseClient) return;
    setLoadingSubjects(true);
    supabaseClient.from('subjects').select('id, name, code, syllabus_type').then(({ data, error }) => {
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

  const fetchLatestResources = async () => {
    if (!supabaseClient) return;
    const { data, error } = await supabaseClient.from('resources').select('*').order('created_at', { ascending: false }).limit(5);
    if (!error) setLatestResources(data);
  };

  const fetchUnapprovedResources = async () => {
    if (!supabaseClient) return;
    const { data, error } = await supabaseClient.from('resources').select('*').eq('approved', false);
    if (!error) setUnapprovedResources(data);
  };

  const approveResource = async (id) => {
    if (!supabaseClient) return;
    const { error } = await supabaseClient.from('resources').update({ approved: true }).eq('id', id);
    if (!error) {
      setUnapprovedResources((prev) => prev.filter((res) => res.id !== id));
      fetchLatestResources();
      setMessage("✅ Resource approved successfully");
      setMessageType("success");
    }
  };

  const deleteResource = async (id) => {
    if (!supabaseClient) return;
    const { error } = await supabaseClient.from('resources').delete().eq('id', id);
    if (!error) {
      setUnapprovedResources((prev) => prev.filter((res) => res.id !== id));
      fetchLatestResources();
      setMessage("❌ Resource deleted");
      setMessageType("error");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!supabaseClient) return;
    setLoginLoading(true);
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
    if (!error) {
      setStaffUser(data.user);
      setMessage('Logged in successfully!');
      setMessageType('success');
    } else {
      setMessage(`Login failed: ${error.message}`);
      setMessageType('error');
    }
    setLoginLoading(false);
  };

  const handleLogout = async () => {
    if (!supabaseClient) return;
    await supabaseClient.auth.signOut();
    setStaffUser(null);
    setMessage('Logged out.');
    setMessageType('success');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !link || !selectedSubjectId || !resourceType) {
      setMessage("Fill all required fields");
      setMessageType('error');
      return;
    }
    const unitValue = unitChapter.trim() === '' ? 'General' : unitChapter.trim();
    const { error } = await supabaseClient.from('resources').insert({
      title,
      link,
      description,
      resource_type: resourceType,
      subject_id: selectedSubjectId,
      unit_chapter_name: unitValue,
      uploaded_by_username: staffUsername,
      approved: false
    });
    if (error) {
      setMessage(`Submission failed: ${error.message}`);
      setMessageType('error');
    } else {
      setMessage("✅ Resource added successfully");
      setMessageType('success');
      setTitle('');
      setLink('');
      setDescription('');
      fetchUnapprovedResources();
      fetchLatestResources();
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!newSubjectName || !newSubjectCode || !newSubjectType) {
      setMessage('All fields are required for adding a subject');
      setMessageType('error');
      return;
    }
    const { error } = await supabaseClient.from('subjects').insert({
      name: newSubjectName,
      code: newSubjectCode,
      syllabus_type: newSubjectType
    });
    if (error) {
      setMessage(`Failed to add subject: ${error.message}`);
      setMessageType('error');
    } else {
      setMessage('✅ Subject added successfully');
      setMessageType('success');
      setNewSubjectName('');
      setNewSubjectCode('');
      setNewSubjectType('');
      const { data } = await supabaseClient.from('subjects').select('*');
      setSubjects(data || []);
    }
  };

  const openEditResource = (resource) => {
    setEditResource(resource);
    setEditForm({
      title: resource.title || '',
      description: resource.description || '',
      link: resource.link || '',
      unit_chapter_name: resource.unit_chapter_name || '',
      resource_type: resource.resource_type || resource.resourceType || '',
      subject_id: resource.subject_id || '',
    });
    setShowEditModal(true);
  };

  const closeEditResource = () => {
    setEditResource(null);
    setEditForm({});
    setShowEditModal(false);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveEditResource = async () => {
    if (!supabaseClient || !editResource) return;
    setEditLoading(true);
    const { error } = await supabaseClient.from('resources').update({
      title: editForm.title,
      description: editForm.description,
      link: editForm.link,
      unit_chapter_name: editForm.unit_chapter_name,
      resource_type: editForm.resource_type,
      subject_id: editForm.subject_id,
    }).eq('id', editResource.id);
    setEditLoading(false);
    if (error) {
      setMessage(`Failed to update resource: ${error.message}`);
      setMessageType('error');
    } else {
      setMessage('✅ Resource updated successfully');
      setMessageType('success');
      closeEditResource();
      fetchUnapprovedResources();
      fetchLatestResources();
    }
  };

  const deleteApprovedResource = async (id) => {
    if (!supabaseClient) return;
    const { error } = await supabaseClient.from('resources').delete().eq('id', id);
    if (!error) {
      setMessage('❌ Resource deleted');
      setMessageType('error');
      fetchLatestResources();
    }
  };

  return (
    <div className="min-h-screen bg-blue-100 p-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="bg-white rounded-2xl shadow-lg max-w-3xl mx-auto p-6">
        {!staffUser ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <h2 className="text-2xl font-bold mb-2 text-blue-700 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              Staff Login
            </h2>
            <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="Staff Email" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required />
            <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Password" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required />
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded-lg flex items-center justify-center gap-2">{loginLoading ? <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>} {loginLoading ? 'Logging in...' : 'Login'}</button>
          </form>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-600">Logged in as <span className="font-semibold text-blue-700">{staffUser.email}</span></p>
              <button onClick={handleLogout} className="text-sm text-blue-600 hover:underline flex items-center gap-1 rounded-md px-2 py-1 transition-colors hover:bg-blue-50"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>Logout</button>
            </div>
            <div className="flex space-x-4 border-b mb-4">
              <button onClick={() => setActiveTab('upload')} className={`py-2 px-4 flex items-center gap-1 rounded-t-lg ${activeTab === 'upload' ? 'border-b-2 border-blue-600 font-semibold text-blue-700 bg-blue-50' : 'text-gray-500 hover:text-blue-600'}`}><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg>Upload Resource</button>
              <button onClick={() => setActiveTab('approve')} className={`py-2 px-4 flex items-center gap-1 rounded-t-lg ${activeTab === 'approve' ? 'border-b-2 border-blue-600 font-semibold text-blue-700 bg-blue-50' : 'text-gray-500 hover:text-blue-600'}`}><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6m-6 0h6" /></svg>Approve Resources</button>
              <button onClick={() => setActiveTab('subjects')} className={`py-2 px-4 flex items-center gap-1 rounded-t-lg ${activeTab === 'subjects' ? 'border-b-2 border-blue-600 font-semibold text-blue-700 bg-blue-50' : 'text-gray-500 hover:text-blue-600'}`}><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>Add Subject</button>
            </div>
            {message && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`mb-4 p-3 rounded text-sm flex items-center gap-2 ${messageType === 'success' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>{messageType === 'success' ? <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> : <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>}<span>{message}</span></motion.div>
            )}
            {activeTab === 'upload' && (
              <>
                <h2 className="text-xl font-semibold text-blue-700 mb-2 flex items-center gap-2"><svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg>Upload Resource</h2>
                <form onSubmit={handleSubmit} className="space-y-4 bg-blue-50 p-4 rounded-2xl border border-blue-100">
                  <div className="space-y-2">
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title *" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required />
                    <input type="text" value={unitChapter} onChange={(e) => setUnitChapter(e.target.value)} placeholder="Unit/Chapter (optional)" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" />
                    <input type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="Link *" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required />
                    <span className="text-xs text-gray-500">Paste a valid URL (Google Drive, Dropbox, etc.)</span>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition"></textarea>
                  </div>
                  <div className="flex flex-col md:flex-row gap-2">
                    <select value={resourceType} onChange={(e) => setResourceType(e.target.value)} className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition">
                      {resourceCategories.map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                    <select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)} className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition">
                      {subjects.map((sub) => (
                        <option key={sub.id} value={sub.id}>{sub.name} ({sub.code}) - {sub.syllabus_type}</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded-lg flex items-center justify-center gap-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 10l5 5m0 0l5-5m-5 5V4" /></svg>Submit Resource</button>
                </form>
              </>
            )}
            {activeTab === 'approve' && (
              <>
                <h2 className="text-xl font-semibold text-blue-700 mb-2 flex items-center gap-2"><svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6m-6 0h6" /></svg>Approve Resources</h2>
                <div className="divide-y divide-blue-100">
                  {unapprovedResources.length === 0 && <div className="text-gray-500 text-sm py-4">No unapproved resources 🎉</div>}
                  {unapprovedResources.map((res) => {
                    const subject = subjects.find(sub => sub.id === res.subject_id);
                    return (
                      <div key={res.id} className="bg-gray-50 p-4 rounded-lg mb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div className="w-full">
                          <p className="font-bold text-blue-800 text-lg mb-1">{res.title}</p>
                          <p className="text-sm text-gray-600 mb-1">{res.description}</p>
                          <a href={res.link} className="text-blue-500 underline text-sm break-all" target="_blank" rel="noopener noreferrer">{res.link}</a>
                          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-700">
                            <div><span className="font-semibold">Added by:</span> {res.uploaded_by_username || 'Unknown'}</div>
                            <div><span className="font-semibold">Subject:</span> {subject ? `${subject.name} (${subject.code}) - ${subject.syllabus_type}` : 'Unknown'}</div>
                            <div><span className="font-semibold">Suggested on:</span> {res.created_at ? new Date(res.created_at).toLocaleString() : 'Unknown'}</div>
                            <div><span className="font-semibold">Reviewed by:</span> <span className="italic text-gray-400">Not reviewed yet</span></div>
                            <div><span className="font-semibold">Reviewed at:</span> <span className="italic text-gray-400">Not reviewed yet</span></div>
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-2 md:mt-0">
                          <button onClick={() => approveResource(res.id)} className="bg-green-500 hover:bg-green-600 transition text-white px-3 py-1 rounded-md flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Approve</button>
                          <button onClick={() => openEditResource(res)} className="bg-yellow-400 hover:bg-yellow-500 transition text-white px-3 py-1 rounded-md flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6 6M3 17v4h4l12-12a2 2 0 00-2.828-2.828L3 17z" /></svg>Edit</button>
                          <button onClick={() => deleteResource(res.id)} className="bg-red-500 hover:bg-red-600 transition text-white px-3 py-1 rounded-md flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>Delete</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            {activeTab === 'subjects' && (
              <>
                <h2 className="text-xl font-semibold text-blue-700 mb-2 flex items-center gap-2"><svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>Add Subject</h2>
                <form onSubmit={handleAddSubject} className="space-y-4 bg-blue-50 p-4 rounded-2xl border border-blue-100">
                  <input type="text" value={newSubjectName} onChange={(e) => setNewSubjectName(e.target.value)} placeholder="Subject Name *" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required />
                  <input type="text" value={newSubjectCode} onChange={(e) => setNewSubjectCode(e.target.value)} placeholder="Subject Code *" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required />
                  <input type="text" value={newSubjectType} onChange={(e) => setNewSubjectType(e.target.value)} placeholder="Syllabus Type *" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" required />
                  <span className="text-xs text-gray-500">e.g. IAL, IGCSE, etc.</span>
                  <button type="submit" className="w-full bg-green-600 hover:bg-green-700 transition text-white py-2 rounded-lg flex items-center justify-center gap-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>Add Subject</button>
                </form>
              </>
            )}
            {showEditModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-lg relative">
                  <button onClick={closeEditResource} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl">&times;</button>
                  <h3 className="text-lg font-semibold mb-4 text-blue-700">Edit Resource</h3>
                  <div className="space-y-3">
                    <input name="title" value={editForm.title} onChange={handleEditFormChange} placeholder="Title" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" />
                    <input name="unit_chapter_name" value={editForm.unit_chapter_name} onChange={handleEditFormChange} placeholder="Unit/Chapter (optional)" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" />
                    <input name="link" value={editForm.link} onChange={handleEditFormChange} placeholder="Link" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition" />
                    <textarea name="description" value={editForm.description} onChange={handleEditFormChange} placeholder="Description (optional)" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition"></textarea>
                    <select name="resource_type" value={editForm.resource_type} onChange={handleEditFormChange} className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition">
                      {resourceCategories.map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                    <select name="subject_id" value={editForm.subject_id} onChange={handleEditFormChange} className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition">
                      {subjects.map((sub) => (
                        <option key={sub.id} value={sub.id}>{sub.name} ({sub.code}) - {sub.syllabus_type}</option>
                      ))}
                    </select>
                    <button onClick={saveEditResource} disabled={editLoading} className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded-lg flex items-center justify-center gap-2 mt-2">{editLoading ? 'Saving...' : 'Save Changes'}</button>
                  </div>
                </div>
              </div>
            )}
            {latestResources.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-blue-700 mb-2 flex items-center gap-2"><svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6m-6 0h6" /></svg>Latest Approved Resources</h2>
                <div className="divide-y divide-blue-100">
                  {latestResources.map((res) => {
                    const subject = subjects.find(sub => sub.id === res.subject_id);
                    return (
                      <div key={res.id} className="bg-gray-50 p-4 rounded-lg mb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div className="w-full">
                          <p className="font-bold text-blue-800 text-lg mb-1">{res.title}</p>
                          <p className="text-sm text-gray-600 mb-1">{res.description}</p>
                          <a href={res.link} className="text-blue-500 underline text-sm break-all" target="_blank" rel="noopener noreferrer">{res.link}</a>
                          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-700">
                            <div><span className="font-semibold">Added by:</span> {res.uploaded_by_username || 'Unknown'}</div>
                            <div><span className="font-semibold">Subject:</span> {subject ? `${subject.name} (${subject.code}) - ${subject.syllabus_type}` : 'Unknown'}</div>
                            <div><span className="font-semibold">Suggested on:</span> {res.created_at ? new Date(res.created_at).toLocaleString() : 'Unknown'}</div>
                            <div><span className="font-semibold">Reviewed by:</span> <span className="italic text-gray-400">Not tracked</span></div>
                            <div><span className="font-semibold">Reviewed at:</span> <span className="italic text-gray-400">Not tracked</span></div>
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-2 md:mt-0">
                          <button onClick={() => openEditResource(res)} className="bg-yellow-400 hover:bg-yellow-500 transition text-white px-3 py-1 rounded-md flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6 6M3 17v4h4l12-12a2 2 0 00-2.828-2.828L3 17z" /></svg>Edit</button>
                          <button onClick={() => deleteApprovedResource(res.id)} className="bg-red-500 hover:bg-red-600 transition text-white px-3 py-1 rounded-md flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>Delete</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
