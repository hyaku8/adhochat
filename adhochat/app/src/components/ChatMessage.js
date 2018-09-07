import React, { Component } from 'react';
import { Sidebar, Segment, Menu, Header, Icon, Container } from 'semantic-ui-react';

export class ChatMessage extends Component {

    render() {
        return (
            <li>{this.props.message.user} says: {this.props.message.content}</li>
        );
    }

}

export default ChatMessage;
