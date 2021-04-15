
import React from 'react'
import { Tooltip } from 'antd';

let ellipsisClass = {
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden'
}

let genellipsisClass = (column) => {
    return {
        ...ellipsisClass,
        width: `${column.width}px`
    }
}
export const genColumns = (columns) => {
    return columns.map((column) => {
        console.log(column)
        if (column.width) {
            column.render = (text, record) => {
                return (
                    <Tooltip title={text}>
                        <p style={genellipsisClass(column)}>{text}</p>
                    </Tooltip>
                )
            }
        }
        return column
    })
}