import React from 'react';
import { render } from '@testing-library/react';
import Footer from './Footer';

describe('Footer component', () => {
  test('renders without crashing', () => {
    const { container } = render(<Footer />);
    expect(container).toBeEmptyDOMElement();
  });
});
