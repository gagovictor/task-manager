import React, { useEffect, useRef, useState } from 'react';
import { Box, TextField, Checkbox, IconButton, InputAdornment } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { v4 as uuidv4 } from 'uuid';
import { ChecklistItem } from '../models/checklist';

interface ChecklistProps {
  items: ChecklistItem[];
  onItemsChange: (items: ChecklistItem[]) => void;
}

const Checklist: React.FC<ChecklistProps> = ({ items, onItemsChange }) => {
  const itemRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [focusAfterDelete, setFocusAfterDelete] = useState<string | null>(null);

  useEffect(() => {
    // Add a new empty item if the last item's text is not empty
    if (items.length === 0 || items[items.length - 1]?.text.trim() !== '') {
      const newItem = { id: uuidv4(), text: '', completed: false };
      onItemsChange([...items, newItem]);
      
      setFocusAfterDelete(null);

      if (itemRefs.current[newItem.id]) {
        itemRefs.current[newItem.id]?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [items, onItemsChange]);

  useEffect(() => {
    if (focusAfterDelete) {
      const input = itemRefs.current[focusAfterDelete];
      input?.focus();
      setFocusAfterDelete(null);
    }
  }, [items, focusAfterDelete]);

  const handleChecklistChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], text: e.target.value };
    onItemsChange(newItems);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    index: number
  ) => {
    const currentItem = items[index];
    if (e.key === 'Backspace' && currentItem.text === '') {
      e.preventDefault();

      const previousItem = items[index - 1];
      if (previousItem) {
        setFocusAfterDelete(previousItem.id);
      }
      removeChecklistItem(currentItem.id);
    }
  };

  const removeChecklistItem = (id: string) => {
    // Ensure that at least one empty item remains
    if (items.length === 1) return;

    const newItems = items.filter((item) => item.id !== id);
    onItemsChange(newItems);
  };

  const toggleChecklistItemCompletion = (id: string) => {
    const newItems = items.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    onItemsChange(newItems);
  };

  return (
    <Box sx={{ minHeight: '178px' }}>
      {items.map((item, index) => {
        const isLastItem = index === items.length - 1;

        return (
          <Box
            key={item.id}
            display="flex"
            alignItems="center"
            mb={1}
          >
            <Checkbox
              checked={item.completed}
              onChange={() => toggleChecklistItemCompletion(item.id)}
            />
            <TextField
              value={item.text}
              onChange={(e) => handleChecklistChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              placeholder={`Item ${index + 1}`}
              fullWidth
              variant="outlined"
              size="small"
              inputRef={(el) => (itemRefs.current[item.id] = el)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => {
                        const previousItem = items[index - 1];
                        if (previousItem) {
                          setFocusAfterDelete(previousItem.id);
                        }
                        removeChecklistItem(item.id);
                      }}
                      edge="end"
                      aria-label={`Remove item ${index + 1}`}
                      disabled={isLastItem && item.text === ''}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        );
      })}
    </Box>
  );
};

export default Checklist;
