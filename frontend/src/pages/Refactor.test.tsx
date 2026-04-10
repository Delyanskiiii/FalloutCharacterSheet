import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Refactor from './Refactor';

const mockProps = {
  characters: [],
  loadSheet: jest.fn(),
};

describe('Refactor Component Automated Tests', () => {
  
  test('scenario: Global Tag Management', () => {
    render(<Refactor {...mockProps} />);
    const input = screen.getByPlaceholderText(/Enter tag name/i);
    const addButton = screen.getByText(/Add Tag/i);

    // Add a unique tag
    fireEvent.change(input, { target: { value: 'Firearms' } });
    fireEvent.click(addButton);
    expect(screen.getByText('Firearms')).toBeInTheDocument();

    // Verify removal
    const deleteButton = screen.getByText('×');
    fireEvent.click(deleteButton);
    expect(screen.queryByText('Firearms')).not.toBeInTheDocument();
  });

  test('scenario: Category Unique Naming', () => {
    render(<Refactor {...mockProps} />);
    const addCatBtn = screen.getByText(/Add Category/i);

    // Add two categories
    fireEvent.click(addCatBtn);
    fireEvent.click(addCatBtn);

    const inputs = screen.getAllByPlaceholderText(/Category name/i);
    expect(inputs[0]).toHaveValue('New Category');
    expect(inputs[1]).toHaveValue('New Category 1');

    // Force a duplicate
    fireEvent.change(inputs[1], { target: { value: 'New Category' } });
    expect(screen.getAllByText(/Category name must be unique/i)).toHaveLength(2);
  });

  test('scenario: Multi-Tier Property Expansion', () => {
    render(<Refactor {...mockProps} />);
    
    // Setup: Add category, show properties, enable description, add item
    fireEvent.click(screen.getByText(/Add Category/i));
    fireEvent.click(screen.getByText(/Show Item Properties/i));
    fireEvent.click(screen.getByLabelText('description'));
    fireEvent.click(screen.getByText(/\+ Item/i));

    // Find maxTier input and change to 2
    const maxTierInput = screen.getByLabelText(/maxTier/i);
    fireEvent.change(maxTierInput, { target: { value: '2' } });

    // Assert UI changed to tiered inputs
    expect(screen.getByText(/description \(Tiered Values\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Tier 1:/i)).toBeInTheDocument();
    expect(screen.getByText(/Tier 2:/i)).toBeInTheDocument();
  });

  test('scenario: Multi-Tier Data Collapse Migration', () => {
    render(<Refactor {...mockProps} />);
    fireEvent.click(screen.getByText(/Add Category/i));
    fireEvent.click(screen.getByText(/Show Item Properties/i));
    fireEvent.click(screen.getByLabelText('description'));
    fireEvent.click(screen.getByText(/\+ Item/i));

    // Set to 2 tiers and fill them
    fireEvent.change(screen.getByLabelText(/maxTier/i), { target: { value: '2' } });
    const tierInputs = screen.getAllByRole('textbox'); // description inputs
    fireEvent.change(tierInputs[0], { target: { value: 'High Level' } });
    fireEvent.change(tierInputs[1], { target: { value: 'God Level' } });

    // Collapse back to 1 tier
    fireEvent.change(screen.getByLabelText(/maxTier/i), { target: { value: '1' } });

    // Assert UI returned to single input and kept the first value
    expect(screen.queryByText(/Tier 2:/i)).not.toBeInTheDocument();
    expect(screen.getByDisplayValue('High Level')).toBeInTheDocument();
  });

  test('scenario: Category Minimization', () => {
    render(<Refactor {...mockProps} />);
    fireEvent.click(screen.getByText(/Add Category/i));
    
    // Expanded content (toggle button for properties) should be visible
    expect(screen.getByText(/Show Item Properties/i)).toBeInTheDocument();
    
    // Find and click minimize button
    fireEvent.click(screen.getByTitle('Minimize Category'));
    
    // Content should be hidden
    expect(screen.queryByText(/Show Item Properties/i)).not.toBeInTheDocument();
    expect(screen.getByTitle('Expand Category')).toBeInTheDocument();
  });
});
