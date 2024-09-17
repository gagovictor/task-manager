import React from 'react';
import { Box, TextField, Checkbox, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { v4 as uuidv4 } from 'uuid';
import { ChecklistItem } from '../models/checklist';

interface ChecklistProps {
  items: ChecklistItem[];
  onItemsChange: (items: ChecklistItem[]) => void;
}

const Checklist: React.FC<ChecklistProps> = ({ items, onItemsChange }) => {
  const handleChecklistChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], text: e.target.value };
    if (index === newItems.length - 1 && e.target.value.trim() !== '') {
      newItems.push({ id: uuidv4(), text: '', completed: false });
    }
    onItemsChange(newItems);
  };

  const toggleChecklistItemCompletion = (id: string) => {
    const newItems = items.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    onItemsChange(newItems);
  };

  const removeChecklistItem = (id: string) => {
    const newItems = items.filter((item) => item.id !== id);
    onItemsChange(newItems);
  };

  return (
    <Box sx={{ minHeight: '178px' }}>
      {items.map((item, index) => (
        <Box key={item.id} display="flex" alignItems="center" mb={1}>
          <Checkbox
            checked={item.completed}
            onChange={() => toggleChecklistItemCompletion(item.id)}
          />
          <TextField
            value={item.text}
            onChange={(e) => handleChecklistChange(e as any, index)}
            placeholder={`Item ${index + 1}`}
            fullWidth
          />
          <IconButton
            onClick={() => removeChecklistItem(item.id)}
            aria-label="Remove item"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      ))}
    </Box>
  );
};

export default Checklist;
