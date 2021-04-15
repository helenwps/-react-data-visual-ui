import React, {useRef, useEffect} from 'react'
interface initialProps {
    text: string
}
export default (props): React.FC<initialProps> => {
    const textWrapper = useRef(null)
    const {text} = props
    useEffect(() => {
        if (textWrapper) {

        }
    }, [textWrapper])
    return (
        <div>
          <Tooltip placement="top" title={text} ref={textWrapper} />
          {/* <span>
              {text}
          </span> */}
        </div>
    )
}