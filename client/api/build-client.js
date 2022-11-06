import axios from 'axios'

const axiosBuilder = ({req}) => {
    if(typeof window === "undefined"){
        //server side
        return axios.create({
            baseURL: "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local",
            headers: req.headers
        })
    }else{
        return axios.create()
    }
}


export default axiosBuilder
