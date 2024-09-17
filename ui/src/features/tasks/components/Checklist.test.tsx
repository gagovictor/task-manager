import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import Checklist from './Checklist';
import { ChecklistItem } from '../models/checklist';
import userEvent from '@testing-library/user-event';

describe('Checklist component', () => {
    it('renders correctly with initial items', () => {
        const items: ChecklistItem[] = [
            { id: '1', text: 'Item 1', completed: false },
            { id: '2', text: 'Item 2', completed: true },
        ];
        const onItemsChange = jest.fn();
        render(<Checklist items={items} onItemsChange={onItemsChange} />);
        
        expect(screen.getByDisplayValue('Item 1')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Item 2')).toBeInTheDocument();
        
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes).toHaveLength(2);
        expect(checkboxes[0]).not.toBeChecked();
        expect(checkboxes[1]).toBeChecked();
    });
    
    
    it('calls onItemsChange when an item text is changed', async () => {
        const initialItems: ChecklistItem[] = [
            { id: '1', text: 'Item 1', completed: false },
        ];
        
        const TestWrapper = () => {
            const [items, setItems] = useState(initialItems);
            
            return <Checklist items={items} onItemsChange={setItems} />;
        };
        
        render(<TestWrapper />);
        
        const textField = screen.getByDisplayValue('Item 1');
        await userEvent.clear(textField);
        await userEvent.type(textField, 'Item 1 Updated');
        
        // Check that the text field now displays the updated text
        expect(screen.getByDisplayValue('Item 1 Updated')).toBeInTheDocument();
    });
    
    it('adds a new item when typing into the last item and it is not empty', async () => {
        const initialItems: ChecklistItem[] = [
            { id: '1', text: '', completed: false },
        ];
        
        const TestWrapper = () => {
            const [items, setItems] = useState(initialItems);
            
            return <Checklist items={items} onItemsChange={setItems} />;
        };
        
        render(<TestWrapper />);
        
        const textField = screen.getByPlaceholderText('Item 1');
        await userEvent.type(textField, 'First item');
        
        // Since we are typing into the last item and it's not empty, a new item should be added
        expect(screen.getAllByRole('textbox')).toHaveLength(2);
        expect(screen.getByDisplayValue('First item')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Item 2')).toBeInTheDocument();
    });
    
    it('toggles completion status when checkbox is clicked', async () => {
        const initialItems: ChecklistItem[] = [
            { id: '1', text: 'Item 1', completed: false },
        ];
        
        const TestWrapper = () => {
            const [items, setItems] = useState(initialItems);
            
            return <Checklist items={items} onItemsChange={setItems} />;
        };
        
        render(<TestWrapper />);
        
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).not.toBeChecked();
        
        await userEvent.click(checkbox);
        
        // After clicking, the checkbox should be checked
        expect(checkbox).toBeChecked();
        
        // Clicking again should toggle back to unchecked
        await userEvent.click(checkbox);
        expect(checkbox).not.toBeChecked();
    });
    
    it('does not add a new item when the last item\'s text is empty', async () => {
        const initialItems: ChecklistItem[] = [
            { id: '1', text: '', completed: false },
        ];
        
        const TestWrapper = () => {
            const [items, setItems] = useState(initialItems);
            
            return <Checklist items={items} onItemsChange={setItems} />;
        };
        
        render(<TestWrapper />);
        
        const textField = screen.getByPlaceholderText('Item 1');
        await userEvent.type(textField, '');
        
        // Since the text is empty, it should not add a new item
        expect(screen.getAllByRole('textbox')).toHaveLength(1);
    });
    
    it('removes an item when the remove button is clicked', async () => {
        const items: ChecklistItem[] = [
            { id: '1', text: 'Item 1', completed: false },
            { id: '2', text: 'Item 2', completed: false },
        ];
        const onItemsChange = jest.fn();
        render(<Checklist items={items} onItemsChange={onItemsChange} />);
        
        expect(screen.getByDisplayValue('Item 1')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Item 2')).toBeInTheDocument();
        
        const removeButtons = screen.getAllByLabelText('Remove item');
        expect(removeButtons).toHaveLength(2);
        
        await userEvent.click(removeButtons[0]);
        
        expect(onItemsChange).toHaveBeenCalled();
        const updatedItems = onItemsChange.mock.calls[onItemsChange.mock.calls.length - 1][0];
        expect(updatedItems).toHaveLength(1);
        expect(updatedItems[0].text).toBe('Item 2');
    });
    
    it('correctly handles an empty list of items', () => {
        const items: ChecklistItem[] = [];
        const onItemsChange = jest.fn();
        render(<Checklist items={items} onItemsChange={onItemsChange} />);
        
        expect(screen.queryByRole('textbox')).toBeNull();
        expect(screen.queryByRole('checkbox')).toBeNull();
        expect(screen.queryByLabelText('Remove item')).toBeNull();
    });
});
