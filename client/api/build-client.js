import axios from 'axios'

const axiosBuilder = ({req}) => {
    if(typeof window === "undefined"){
        //server side
        return axios.create({
            baseURL: "http://drendragon.com",
            headers: req.headers
        })
    }else{
        return axios.create()
    }
}


export default axiosBuilder
