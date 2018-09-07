import React, { Component } from 'react';
import { Sidebar, Segment, Menu, Header, Icon, Container } from 'semantic-ui-react';

export class MessageInput extends Component {

    constructor(props) {
        super(props);
        this.state = { message: '' };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({ message: event.target.value });
    }

    handleSubmit(event) {
        const message = this.state.message;
        this.props.onNewMessage(message);
        this.setState({ message: '' });
        event.preventDefault();
    }


    render() {
        return (
            <form onSubmit={this.handleSubmit} >
                <label>Message: </label>
                <input type="text" name="message" value={this.state.message} onChange={this.handleChange} />
                <input type="submit" value="Submit" />
            </form>
        );
    }

}

export default MessageInput;
