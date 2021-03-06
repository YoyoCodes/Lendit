import React from 'react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import ItemSubmitForm from '../../src/components/itemSubmitForm';

Enzyme.configure({adapter: new Adapter()});

const mockSubmit = jest.fn();
const mockTextChange = jest.fn();
const itemSubmitForm = Enzyme.shallow(
  <ItemSubmitForm handleSubmit={mockSubmit} handleChange={mockTextChange} />
);

describe('ItemSubmitForm', () => {
  describe('html elements', () => {
    it('renders an item name field', () => {
      expect(itemSubmitForm.find('#item_name').length).toEqual(1);
    });

    it('renders two text areas field', () => {
      expect(itemSubmitForm.find('textarea').length).toEqual(2);
    });

    it('renders a button', () => {
      expect(itemSubmitForm.find('button').length).toEqual(1);
    });

    it('renders an image upload component', () => {
      expect(itemSubmitForm.find('#image-upload').length).toEqual(1);
    });
  });

  describe('submit action', () => {
    it('button handles clicks properly', () => {
      itemSubmitForm.find('form').simulate('submit');
      expect(mockSubmit.mock.calls.length).toEqual(1);
    });

    it('textarea handles change properly', () => {
      itemSubmitForm.find('.ItemInput').simulate('change');
      expect(mockTextChange.mock.calls.length).toEqual(1);
    });
  });
});
