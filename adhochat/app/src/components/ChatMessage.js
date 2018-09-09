import React from 'react';

export class ChatMessage extends React.Component {

    render() {
        return (
            <li>{this.props.message.senderId} says: {this.props.message.content}</li>
        );
    }

}

export default ChatMessage;
