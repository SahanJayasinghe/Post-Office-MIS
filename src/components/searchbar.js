import React, {Component} from 'react'

class SearchBox extends Component{
    data = []

    constructor(props) {
        super(props);
        this.state = {
            initialState:'Enter resident key',
            currentText:''
        }
    }

    changeText(currentText) {
        this.setState({currentText});
    }

    render() {
        return (
            <div>
                <div class='colours'>
                    <div class='yellow' />
                    <div class='orange' />
                    <div class='red' />
                    <div class='purple' />
                    <div class='darkblue' />
                    <div class='lightblue' />
                    <div class='bluegreen' />
                    <div class='green' />
                </div>
                <div class='search-bar'>
                    <div>
                        <form>
                            <input class='search-box' type='text' placeholder={this.state.initialState} onChange={this.changeText.bind(this, 'currentText')} callback = {record => console.log(record)} />
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}

export default SearchBox