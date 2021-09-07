import React, { Component } from 'react';
import { Spinner } from 'react-activity';
import 'react-activity/dist/react-activity.css';

export default class Loader extends Component {
    render() {
        return <Spinner />;
    }
}

