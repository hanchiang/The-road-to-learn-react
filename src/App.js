import React, { Component } from 'react';
import { sortBy } from 'lodash';
import classNames from 'classnames';
import logo from './logo.svg';
import './App.css';

import PropTypes from 'prop-types';

const DEFAULT_QUERY = 'react';
const DEFAULT_PAGE = 0;
const DEFAULT_HPP = 100;

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';

// ES6
const url = `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${DEFAULT_QUERY}&${PARAM_PAGE}`;
// console.log(url);

// The function takes the searchTerm and returns another function which takes an item.
// The returned function will be used to filter the list based on the condition defined in the function.
function isSearched(searchTerm) {
    return function(item) {
        return !searchTerm || searchTerm.trim() === '' || item.title.toLowerCase().includes(searchTerm.toLowerCase());
    }
}

const Loading = () => <i className="fa fa-spinner fa-spin fa-2x" aria-hidden="true"></i>

// Higher order component, which takes care of the conditional rendering of a loading indicator or a list listof data when it is available
const withLoading = (Component) => ({ isLoading, ...rest }) =>
    // OPTIONAL: isLoading prop is specific to this component and shouldn't be passed through
    isLoading ? <Loading /> : <Component {...rest} />

// Important to create the HOC outside the render() method
const ButtonWithLoading = withLoading(Button);

function Button({onClick, className, children}) {
    return (
        <button
            onClick={onClick}
            className={className}
            type="button"
        >
            {children}
        </button>
    )
}
Button.propTypes = {
    onClick: PropTypes.func.isRequired,
    className: PropTypes.string,
    children: PropTypes.node.isRequired
};
Button.defaultProps = {
    className: ''
};


class Search extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.input.focus();
        // Put the cursor at the end
        let val = this.input.value;
        this.input.value = "";
        this.input.value = val;
    }

    render() {
        const { onSubmit, onChange, value, children } = this.props;
        return (
            <form onSubmit={onSubmit}>
                {children}{' '}
                <input
                    type="text"
                    value={value}
                    onChange={onChange}
                    ref={(node) => {this.input = node;}}
                />
                <button type="submit">
                    Search
                </button>
            </form>
        );
    }
    
}
Search.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    children: PropTypes.node,
    onSubmit: PropTypes.func.isRequired
};
Search.defaultProps = {
    children: ''
};


function SortCaret({ isSortReverse, sortKey, activeSortKey }) {
    let sortCaret = null;
    if (sortKey === activeSortKey) {
        if ((!isSortReverse && sortKey !== "COMMENTS" && sortKey !== "POINTS") ||
            (isSortReverse && (sortKey === "COMMENTS" || sortKey === "POINTS"))) {
            sortCaret = <i className="fa fa-chevron fa-chevron-up" aria-hidden="true"></i>
        } else if ((isSortReverse && sortKey !== "COMMENTS" && sortKey !== "POINTS") ||
            (!isSortReverse && (sortKey === "COMMENTS" || sortKey === "POINTS"))) {
            sortCaret = <i className="fa fa-chevron fa-chevron-down" aria-hidden="true"></i>
        }
    }
    return sortCaret;
}

function Sort({ sortKey, onSort, children, activeSortKey, isSortReverse }) {
    const handleSort = () => onSort(sortKey);

    const sortClass = classNames(
        "button-inline",
        { 
            "button-active": sortKey === activeSortKey
        }
    );

    return ( 
        <Button onClick={handleSort} className={sortClass}>
            { children }
            <SortCaret isSortReverse={isSortReverse} sortKey={sortKey} activeSortKey={activeSortKey} />
        </Button>
    );
}

class Table extends Component {
    constructor(props) {
        super(props);

        // Move states that are only relevant to Table and Sort from App
        this.state = {
            sortKey: 'NONE',
            isSortReverse: false
        };

        this.onSort = this.onSort.bind(this);
    }

    onSort(sortKey) {
        const isSortReverse = this.state.sortKey === sortKey && !this.state.isSortReverse;
        this.setState({ sortKey, isSortReverse });
    }

    render() {
        const { list, onDismiss } = this.props;
        const { sortKey, isSortReverse } = this.state;
        const sortedList = SORTS[sortKey](list);
        const reverseSortedList = isSortReverse ? sortedList.reverse() : sortedList;

        return (
            <div className="table">
                <div className="table-row-header">
                        <span style={{ width: '40%' }}>
                            <Sort sortKey={'TITLE'} onSort={this.onSort} activeSortKey={sortKey} isSortReverse={isSortReverse}>Title</Sort>
                        </span>
                        <span style={{ width: '30%' }}>
                            <Sort sortKey={'AUTHOR'} onSort={this.onSort} activeSortKey={sortKey} isSortReverse={isSortReverse}>Author</Sort>
                        </span>
                        <span style={{ width: '10%' }}>
                            <Sort sortKey={'COMMENTS'} onSort={this.onSort} activeSortKey={sortKey} isSortReverse={isSortReverse}>Comments</Sort>
                        </span>
                        <span style={{ width: '10%' }}>
                            <Sort sortKey={'POINTS'} onSort={this.onSort} activeSortKey={sortKey} isSortReverse={isSortReverse}>Points</Sort>
                        </span>
                        <span style={{ width: '10%' }}>Archive</span>
                </div>

                { reverseSortedList.map(item => 
                    <div key={item.objectID} className="table-row">
                        <span style={{width: '40%'}}>
                            <a href={item.url}>{item.title}</a>
                        </span>
                        <span style={{width: '30%'}}>{item.author}</span>
                        <span style={{width: '10%'}}>{item.num_comments}</span>
                        <span style={{width: '10%'}}>{item.points}</span>

                        <span style={{width: '10%'}}>
                            <Button onClick={() => onDismiss(item.objectID)} className="button-inline">
                                Dismiss
                            </Button>
                        </span>
                    </div>
                )}
            </div>
        );
    }
}
Table.PropTypes = {
    // list: PropTypes.array.isRequired,
    list: PropTypes.arrayOf(
        PropTypes.shape({
            objectID: PropTypes.string.isRequired,
            author: PropTypes.string,
            url: PropTypes.string,
            num_comments: PropTypes.number,
            points: PropTypes.number
        })
    ).isRequired,
    onDismiss: PropTypes.func.isRequired
};


// Define a list of sort functions for each column of the table
const SORTS = {
    NONE: (list) => list,
    TITLE: (list) => sortBy(list, 'title'),
    AUTHOR: (list) => sortBy(list, 'author'),
    COMMENTS: (list) => sortBy(list, 'num_comments').reverse(),
    POINTS: (list) => sortBy(list, 'points').reverse()
}

const updateSearchTopStoriesState = (hits, page) => (prevState) => {
    const { searchKey, results } = prevState;
    const oldHits = results && results[searchKey] ? results[searchKey].hits : [];
    const updatedHits = [...oldHits, ...hits];
    
    return {
        results: {
            // Copy the entire results object, then overwrite the searchKey result property with the updated hits
            ...results,
            [searchKey]: {hits: updatedHits, page}
        },
        isLoading: false
    };
};

// To cache the results of API calls,
// the results object be a mapping of the search term(key) to the result returned by the API(value)
class App extends Component {
    constructor(props) {
        // Important, must always be the first line in constructor
        super(props);

        // List is part of the component now. Evertime it is changed, the component will be re-rendered
        // However don't mutate the state directly. Instead use setState()
        this.state = {
            results: null,
            searchKey: '',
            searchTerm: DEFAULT_QUERY,
            isLoading: false
        };
        // This ES6 shorthand can be used when the property name in the object is the same as the variable name
        /*
        this.state = {
            list,
        }
        */
        console.log('constructor');

        // Function is bound to the class, so it becomes a class method
        // This binding is necessary to make `this` work in the callback
        this.onDismiss = this.onDismiss.bind(this);
        this.onSearchChange = this.onSearchChange.bind(this);
        this.onSearchSubmit = this.onSearchSubmit.bind(this);

        this.setSearchTopStories = this.setSearchTopStories.bind(this);
        this.fetchSearchtopStories = this.fetchSearchtopStories.bind(this);
        this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this);
    }

    componentWillMount() {
        console.log('will mount');
    }

    componentDidMount() {
        console.log('did mount');
        const {searchTerm} = this.state;
        
        this.setState({searchKey: searchTerm});
        this.fetchSearchtopStories(searchTerm, DEFAULT_PAGE);
    }

    componentWillUnmount() {
        console.log('will unmount');
    }

    setSearchTopStories(result) {
        // To concatenate new and old data when 'More' button is pressed
        const { hits, page } = result;
        this.setState(updateSearchTopStoriesState(hits, page));
    }

    /*
    The fetch API only rejects a promise when a “network error is encountered, although this usually means permissions issues or similar.”
    Meaning user is offline, or some unlikely networking error occurs, such a DNS lookup failure.
    So, we can use the 'ok' flag to check for a successful HTTP response status code
    */
    fetchSearchtopStories(searchTerm, page) {
        this.setState({ isLoading: true });

        fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
            .then(response => { 
                if (response.ok) {
                    return response.json();
                } else {
                    throw Error(response.statusText);
                }
                
            })
            .then(result => this.setSearchTopStories(result))
            .catch(e => e);
    }

    onDismiss(id) {
        const {searchKey, results} = this.state;
        const {hits, page} = results[searchKey];

        const isNotId = (item) => item.objectID !== id;
        const updatedHits = hits.filter(isNotId);
        // Object.assign() is ES5 syntax
        // const updatedResult = Object.assign({}, this.state.result, {hits: updatedHits});

        // ES6 object spread syntax
        // https://github.com/tc39/proposal-object-rest-spread
        this.setState({
            // Copy the entire results object, then overwrite the searchKey result property with the updated hits
            results: {
                ...results, 
                [searchKey]: {hits: updatedHits, page}
            }
        });
        
    }

    onSearchChange(event) {
        this.setState({searchTerm: event.target.value});
    }

    needsToSearchTopStories(searchTerm) {
        return !this.state.results[searchTerm];
    }

    onSearchSubmit(event) {
        // Prevent browser from reloading when form is submitted
        event.preventDefault();
        
        const {searchTerm} = this.state;
        this.setState({searchKey: searchTerm})

        // Do an API call only if the result isn't already saved in the results object
        if (this.needsToSearchTopStories(searchTerm)) {
            this.fetchSearchtopStories(searchTerm, DEFAULT_PAGE);
        }
    }

    render() {
        console.log('render');
        console.log(this.state);
        
        const helloWorld = 'Welcome to the Road to learn React';
        const now = new Date().toLocaleTimeString();

        // ES6 destructuring
        const { searchTerm, results, searchKey, isLoading } = this.state;
        const page = (results && results[searchKey] && results[searchKey].page) || 0;
        const list = (results && results[searchKey] && results[searchKey].hits) || [];

        return (
            <div className="App">
                <div className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <h2>{helloWorld}</h2>
                    <p>Time now is {now}</p>
                </div>
                

                <div className="page">
                    <div className="interactions">
                        <Search
                            value={searchTerm}
                            onChange={this.onSearchChange}
                            onSubmit={this.onSearchSubmit}
                        >
                            Search for item
                        </Search>

                        {/* Higher order component for conditional rendering of result list or empty list */}
                        <ButtonWithLoading
                            isLoading={isLoading}
                            onClick={() => this.fetchSearchtopStories(searchKey, page + 1)}
                        >
                            More
                        </ButtonWithLoading>

                    </div>

                    <Table
                        list={list}
                        onDismiss={this.onDismiss}
                    />

                </div> {/* page */}
            </div>
        );
    }
}

export default App;

export {
    Button,
    Table,
    Search
};