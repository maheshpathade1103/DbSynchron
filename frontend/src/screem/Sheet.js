import React, { useState } from 'react';

function DataDisplay() {
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  
  // States for new entry form
  const [newEntry, setNewEntry] = useState({ Snum: '', NAME: '', REGNO: '' });

  // States for updating an entry
  const [updateEntry, setUpdateEntry] = useState({ Snum: '', NAME: '', REGNO: '' });
  const [isEditing, setIsEditing] = useState(false);

  const fetchData = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/getData/${spreadsheetId}`);
      const result = await response.json();

      if (response.ok) {
        setData(result.data);
        setError('');
      } else {
        setError(result.message || 'Something went wrong.');
      }
    } catch (err) {
      setError('Error fetching data.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleNewEntryChange = (e) => {
    const { name, value } = e.target;
    setNewEntry(prev => ({ ...prev, [name]: value }));
  };

  const handleNewEntrySubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isNewEntry: true,
          ...newEntry,
          spreadsheetId,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setError('');
        setNewEntry({ Snum: '', NAME: '', REGNO: '' }); // Reset new entry form
        fetchData(); // Refetch data to show the updated table
      } else {
        setError(result.message || 'Error adding new entry.');
      }
    } catch (err) {
      setError('Error adding new entry.');
    }
  };

  const handleUpdateEntryChange = (e) => {
    const { name, value } = e.target;
    setUpdateEntry(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateEntrySubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/updateEntry', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...updateEntry,
          spreadsheetId,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setError('');
        setUpdateEntry({ Snum: '', NAME: '', REGNO: '' }); // Reset update form
        setIsEditing(false); // Exit editing mode
        fetchData(); // Refetch data to show the updated table
      } else {
        setError(result.message || 'Error updating entry.');
      }
    } catch (err) {
      setError('Error updating entry.');
    }
  };

  const handleDelete = async (Snum) => {
    try {
      const response = await fetch(`http://localhost:3000/api/deleteEntry/${spreadsheetId}/${Snum}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (response.ok) {
        setError('');
        fetchData(); // Refetch data to show the updated table
      } else {
        setError(result.message || 'Error deleting entry.');
      }
    } catch (err) {
      setError('Error deleting entry.');
    }
  };

  const handleEdit = (row) => {
    setUpdateEntry({ Snum: row[0], NAME: row[1], REGNO: row[2] });
    setIsEditing(true);
  };

  return (
    <div>
      <h1>Google Sheet Data Display</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={spreadsheetId}
          onChange={(e) => setSpreadsheetId(e.target.value)}
          placeholder="Enter Spreadsheet ID"
        />
        <button type="submit">Fetch Data</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <h2>Add New Entry</h2>
      <form onSubmit={handleNewEntrySubmit}>
        <input
          type="text"
          name="Snum"
          value={newEntry.Snum}
          onChange={handleNewEntryChange}
          placeholder="Enter Snum"
          required
        />
        <input
          type="text"
          name="NAME"
          value={newEntry.NAME}
          onChange={handleNewEntryChange}
          placeholder="Enter NAME"
          required
        />
        <input
          type="text"
          name="REGNO"
          value={newEntry.REGNO}
          onChange={handleNewEntryChange}
          placeholder="Enter REGNO"
          required
        />
        <button type="submit">Add Entry</button>
      </form>

      {isEditing && (
        <div>
          <h2>Update Entry</h2>
          <form onSubmit={handleUpdateEntrySubmit}>
            <input
              type="text"
              name="Snum"
              value={updateEntry.Snum}
              onChange={handleUpdateEntryChange}
              placeholder="Enter Snum"
              required
            />
            <input
              type="text"
              name="NAME"
              value={updateEntry.NAME}
              onChange={handleUpdateEntryChange}
              placeholder="Enter NAME"
              required
            />
            <input
              type="text"
              name="REGNO"
              value={updateEntry.REGNO}
              onChange={handleUpdateEntryChange}
              placeholder="Enter REGNO"
              required
            />
            <button type="submit">Update Entry</button>
            <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
          </form>
        </div>
      )}

      {data && (
        <table border="1" style={{ marginTop: '20px' }}>
          <thead>
            <tr>
              {data[0] && data[0].map((header, index) => <th key={index}>{header}</th>)}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(1).map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}
                <td>
                  <button onClick={() => handleEdit(row)}>Edit</button>
                  <button onClick={() => handleDelete(row[0])}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default DataDisplay;
