//封装返回rules的某个规则
export const rulesGen = {
    required: [
        {
            required: true,
            message: '必填项'
        }, {
            whitespace: true,
            message: '不能全部为空格'
        }
    ],
    telephone: [
        {
            pattern: /^1[3|4|5|7|8][0-9]\d{8}$/,
            message: '请输入正确的手机号'
        }
    ],
    email: [
        {
            type: 'email',
            message: '邮箱格式不正确'
        }
    ],
    //长度1000000
    length(min=1,max=1000000){
        return [
            {
                pattern: new RegExp(`^.{${min},${max}}$`),
                message: `长度范围在${min}到${max}`
            }
        ]
    },
    number(len){
        const tempLength = --len
        return [
            {
                pattern: new RegExp(`^[1-9]\\d{0,${tempLength}}$`) ,
                message: `数字长度1到${len}位`
            }
        ]
    }
       
}