import React from 'react';

import * as constants from '../core/constants.js'

import { ChatMessage } from './ChatMessage';
import { MessageInput } from './MessageInput';

export class Chat extends React.Component {

    render() {
        const messages = this.props.chat.messages.map((message, index) =>
            <ChatMessage key={index} message={message}></ChatMessage>);

        return (
            <div>
                <h2>{this.props.chat.title}</h2>
                <ul>
                    {messages}
                </ul>
                <MessageInput chat={this.props.chat} onNewMessage={this.props.sendMessage}></MessageInput>
            </div>
            );
    }
}