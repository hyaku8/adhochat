import React from 'react';

import * as constants from '../core/constants.js'

import { Chat } from './Chat';

export class ChatTab extends React.Component {

    render() {

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