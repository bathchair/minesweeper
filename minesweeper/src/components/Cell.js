import React, { Component } from 'react';
import { Symbols } from '../constants/Constants';
import PropTypes from 'prop-types';

export default class Cell extends Component {
    getValue() {
        const { value } = this.props;

        if (!value.isRevealed) {
            return this.props.value.isFlagged ? Symbols.Flagged : null;
        }
        if (value.isMine) {
            return Symbols.Mine;
        }
        if (value.neighbor === 0) {
            return null;
        }
        return value.neighbor;
    }

    render() {
        const { value, onClick, cMenu } = this.props;
        let className =
          "cell" +
          (value.isRevealed ? "" : " hidden") +
          (value.isMine ? " is-mine" : "") +
          (value.isFlagged ? " is-flag" : "");

        return (
            <div onClick={onClick} className={className} onContextMenu={cMenu}>
                {this.getValue()}
            </div>
        );
    }
}

const cellItemShape = {
    isRevealed: PropTypes.bool,
    isMine: PropTypes.bool,
    isFlagged: PropTypes.bool
}

Cell.propTypes = {
    value: PropTypes.objectOf(PropTypes.shape(cellItemShape)),
    onClick: PropTypes.func,
    cMenu: PropTypes.func
}