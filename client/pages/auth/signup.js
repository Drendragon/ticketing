import {useState} from "react";
import axios from "axios";
import useRequest from "../../hooks/use-request";
import {useRouter} from "next/router";

const signup = () => {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const {doRequest, errors} = useRequest({
        url: "/api/users/signup",
        method: "post",
        body: {
            email, password
        },
        onSuccess: () => router.push('/'),

    });

    const onSubmit = async (e) => {
        e.preventDefault();
        doRequest();
    }

    return (
        <form onSubmit={onSubmit}>
            <h1>Signup</h1>
            <div className="form-group">
                <label htmlFor="email">Email address</label>
                <input
                    value={email}
                    onChange={e => {
                        setEmail(e.target.value)
                    }}
                    type="email"
                    name="email"
                    id="email"
                    className="form-control"/>

                <label htmlFor="password">Email address</label>
                <input
                    value={password}
                    onChange={e => {
                        setPassword(e.target.value)
                    }}
                    type="password"
                    name="password"
                    id="password"
                    className="form-control"/>
                {errors}
                <button
                    type="submit"
                    className="btn btn-primary">
                    Sign up
                </button>
            </div>
        </form>
    )
};

export default signup;
