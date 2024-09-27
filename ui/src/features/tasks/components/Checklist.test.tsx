import { act, useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Checklist from './Checklist';
import { ChecklistItem } from '../models/checklist';
import userEvent from '@testing-library/user-event';

describe('Checklist component', () => {
    beforeAll(() => {
      window.HTMLElement.prototype.scrollIntoView = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
    
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
        
        expect(screen.getAllByRole('textbox')).toHaveLength(2);
        expect(screen.getByDisplayValue('First item')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Item 2')).toBeInTheDocument();
    });
    
    it('adds a new item when clicking the last item and it is not empty', async () => {
        const initialItems: ChecklistItem[] = [
            { id: '1', text: 'Item 1', completed: false },
        ];
        
        const TestWrapper = () => {
            const [items, setItems] = useState(initialItems);
            
            return <Checklist items={items} onItemsChange={setItems} />;
        };
        
        render(<TestWrapper />);
        
        const textField = screen.getByDisplayValue('Item 1');
        await userEvent.click(textField);
        await userEvent.tab(); // Mimic leaving the text field (blur)
        
        expect(screen.getAllByRole('textbox')).toHaveLength(2);
        expect(screen.getByDisplayValue('Item 1')).toBeInTheDocument();
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
        
        await waitFor(async () => {
            const checkbox = await screen.findAllByRole('checkbox');
            expect(checkbox[0]).not.toBeChecked();
            expect(checkbox[1]).not.toBeChecked();
            
            await userEvent.click(checkbox[0]);
            
            expect(checkbox[0]).toBeChecked();
            expect(checkbox[1]).not.toBeChecked(); // Empty checklist item added at the end
            
            await userEvent.click(checkbox[0]);
            expect(checkbox[0]).not.toBeChecked();
        });
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
        
        act(() => userEvent.tab());

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
        
        const removeButtons = screen.getAllByLabelText(/Remove item \d+/);
        expect(removeButtons).toHaveLength(2);
        
        await userEvent.click(removeButtons[0]);
        
        expect(onItemsChange).toHaveBeenCalled();
        const updatedItems = onItemsChange.mock.calls[onItemsChange.mock.calls.length - 1][0];
        expect(updatedItems).toHaveLength(1);
        expect(updatedItems[0].text).toBe('Item 2');
    });
    
    it('handles an empty list by rendering one empty item', () => {
        const items: ChecklistItem[] = [];
        const onItemsChange = jest.fn();
        
        render(<Checklist items={items} onItemsChange={onItemsChange} />);
        
        waitFor(() => {
            const textFields = screen.getAllByRole('textbox');
            expect(textFields).toHaveLength(1);
            expect(textFields[0]).toHaveValue('');
            
            const checkboxes = screen.getAllByRole('checkbox');
            expect(checkboxes).toHaveLength(1);
            
            // The remove button for the single item should be disabled
            const removeButtons = screen.getAllByLabelText(/Remove item \d+/);
            expect(removeButtons).toHaveLength(1);
            expect(removeButtons[0]).toBeDisabled();
        })
    });
    
    it('removes an item when Backspace is pressed on an empty text field and focuses the previous item', async () => {
        const initialItems: ChecklistItem[] = [
            { id: '1', text: 'First item', completed: false },
            { id: '2', text: '', completed: false },
            { id: '3', text: 'Third item', completed: false },
        ];

        const TestWrapper = () => {
            const [items, setItems] = useState(initialItems);

            return <Checklist items={items} onItemsChange={setItems} />;
        };

        render(<TestWrapper />);

        const firstTextField = screen.getByDisplayValue('First item');
        const secondTextField = screen.getByPlaceholderText('Item 2'); // Empty item

        expect(secondTextField).toHaveValue('');
        secondTextField.focus();
        expect(secondTextField).toHaveFocus();
        await userEvent.type(secondTextField, '{backspace}');

        await waitFor(() => {
            const textFields = screen.getAllByRole('textbox');
            expect(textFields).toHaveLength(3); // Two remaining items + newly added empty field

            expect(screen.getByDisplayValue('First item')).toBeInTheDocument();
            expect(screen.queryByDisplayValue('Second item')).not.toBeInTheDocument();
            expect(screen.getByDisplayValue('Third item')).toBeInTheDocument();

            const thirdItemRelocated = screen.queryByPlaceholderText('Item 2');
            expect(thirdItemRelocated).toBeInTheDocument();
            expect(thirdItemRelocated).toHaveValue('Third item');

            // The focus should now be on the first text field
            expect(firstTextField).toHaveFocus();
        });
    });

    it('does not remove an item when Backspace is pressed on a non-empty text field', async () => {
        const initialItems: ChecklistItem[] = [
            { id: '1', text: 'First item', completed: false },
            { id: '2', text: 'Second item', completed: false },
        ];

        const TestWrapper = () => {
            const [items, setItems] = useState(initialItems);

            return <Checklist items={items} onItemsChange={setItems} />;
        };

        render(<TestWrapper />);

        await waitFor(async () => {
            const firstTextField = screen.getByDisplayValue('First item');
            const secondTextField = screen.getByDisplayValue('Second item');
    
            secondTextField.focus();
            expect(secondTextField).toHaveFocus();
            await userEvent.type(secondTextField, '{backspace}');
                
            const textFields = screen.getAllByRole('textbox');
            expect(textFields).toHaveLength(3); // Two initial items + empty field at the last index

            expect(screen.getByPlaceholderText('Item 2')).toHaveValue('Second ite');
            expect(screen.getByPlaceholderText('Item 3')).toHaveValue('');

            expect(secondTextField).toHaveFocus();
        })
    });

    it('adds a new item when typing in the last item', async () => {
        const initialItems: ChecklistItem[] = [
            { id: '1', text: 'Item 1', completed: false },
            { id: '2', text: 'Item 2', completed: false },
        ];

        const TestWrapper = () => {
            const [items, setItems] = useState(initialItems);

            return <Checklist items={items} onItemsChange={setItems} />;
        };

        render(<TestWrapper />);

        const secondTextField = screen.getByDisplayValue('Item 2');

        await userEvent.type(secondTextField, 'Second item');

        await waitFor(() => {
            const textFields = screen.getAllByRole('textbox');
            expect(textFields).toHaveLength(3);
            expect(screen.getByPlaceholderText('Item 3')).toBeInTheDocument();
        });
    });
});
