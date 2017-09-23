import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';	// For snapshot testing with jest
import { shallow } from 'enzyme';			// For unit testing with enzyme
import App, { Search, Button, Table } from './App';

describe('App', () => {
	it('renders', () => {
		const div = document.createElement('div');
		ReactDOM.render(<App />, div);
	});

	test('snapshots', () => {
		const component = renderer.create(<App />);
		let tree = component.toJSON();
		expect(tree).toMatchSnapshot();
	});

});

describe('Search', () => {
	const props = {
		value: 'hi',
		onChange: function() { console.log('onChange in search'); },
		onSubmit: function() { console.log('onSubmit in search'); }
	}

	it('renders', () => {
		const div = document.createElement('div');
		ReactDOM.render(<Search {...props}>Search</Search>, div)
	});

	test('snapshots', () => {
		const component = renderer.create(<Search {...props}>Search</Search>);
		let tree = component.toJSON();
		expect(tree).toMatchSnapshot();
	});
});

describe('Button', () => {
	const props = {
		onClick: function() { console.log('onClick in button'); }
	}

	it('renders', () => {
		const div = document.createElement('div');
		ReactDOM.render(<Button {...props}>Give me more</Button>, div);
	});

	test('snapshots', () => {
		const component = renderer.create(<Button {...props}>Give me more</Button>);
		let tree = component.toJSON();
		expect(tree).toMatchSnapshot();
	});
});


describe('Table', () => {
	const props = {
		list: [
			{ title: '1', author: '1', num_comments: 1, points: 2, objectID: 'y'},
			{ title: '2', author: '2', num_comments: 1, points: 2, objectID: 'z'}
		],
		sortKey: 'TITLE',
		isSortReverse: false
	};

	it('renders', () => {
		const div = document.createElement('div');
		ReactDOM.render(<Table {...props} />, div);
	});

	test('snapshots', () => {
		const component = renderer.create(<Table {...props} />);
		let tree = component.toJSON();
		expect(tree).toMatchSnapshot();
	});

	// Unit testing with enzyme
	it('shows two items in a list', () => {
		const element = shallow(<Table {...props} />)
		expect(element.find('.table-row').length).toBe(2);
	});
});