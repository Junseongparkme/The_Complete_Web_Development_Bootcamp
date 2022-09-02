import { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';

const CreateArea = ({ onAdd }) => {
  const [note, setNote] = useState({
    title: '',
    content: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setNote((prevNote) => ({
      ...prevNote,
      [name]: value,
    }));
  };

  const handleClick = (e) => {
    e.preventDefault();
    if (note.title === '') return;
    onAdd(note);
    setNote((prevNote) => ({
      title: '',
      content: '',
    }));
  };

  return (
    <div>
      <form>
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={note.title}
          onChange={handleChange}
        />
        <textarea
          name="content"
          cols="30"
          placeholder="Take a note ..."
          value={note.content}
          onChange={handleChange}
        />
        <button onClick={handleClick}>
          <AddIcon />
        </button>
      </form>
    </div>
  );
};

export default CreateArea;
