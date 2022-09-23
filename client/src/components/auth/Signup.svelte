<script lang="ts">
import { Link, useNavigate } from "svelte-navigator";
import { login, signup } from "../../repo/lib/authFetch";
import Field from "../common/Field.svelte";

let name: string;
let username: string;
let password: string;
let passwordCheck: string;
let error: string = undefined;

const navigate = useNavigate();

const syncName = (e: CustomEvent<{ value: string}>) => {
    name = e.detail.value;
};

const syncUsername = (e: CustomEvent<{ value: string}>) => {
    username = e.detail.value;
};

const syncPassword = (e: CustomEvent<{ value: string}>) => {
    password = e.detail.value;
};

const syncPasswordCheck = (e: CustomEvent<{ value: string}>) => {
    passwordCheck = e.detail.value;
};

const onSignup = async () => {
    if (password !== passwordCheck) {
        error = `Passwords don't match.`;
    } else if (!name || !name.length) {
        error = 'Must enter a name.';
    } else if (!username || !username.length) {
        error = 'Must enter a username.';
    } else if (!password || !password.length) {
        error = 'Must enter a password.';
    } else {
        error = '';
        const success = await signup(name, username, password);
        password = '';
        if (success) {
            navigate('/');
        } else {
            error = 'Login failed. Username or password incorrect.';
        }
    }
};
</script>

<div class="auth">
    <Field title="Name" type="string" fixedValue={name} on:change={syncName} editable grow max={70}/>
    <Field title="Username" type="string" fixedValue={username} on:change={syncUsername} editable grow max={70}/>
    <Field title="Password" type="string" fixedValue={password} on:change={syncPassword} editable password grow max={70}/>
    <Field title="Confirm Password" type="string" fixedValue={passwordCheck} on:change={syncPasswordCheck} editable password grow max={70}/>
    {#if error !== undefined}
    <div class="error">
        {error}
    </div>
    {/if}
    <button on:click={onSignup}>Signup</button>
    <div class="link">
        <Link to="/login">Already have an account? Click here to log in.</Link>
    </div>
</div>

<style>
    .auth {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 400px;
        justify-content: center;
        align-items: center;
        padding: 30px;
    }

    .error {
        margin-top: 10px;
        color: #c33;
    }

    button {
        cursor: pointer;
        display: flex;
        flex-direction: column;
        border: 1px solid #bfbfbf;
        border-radius: 5px;
        padding: 3px 7px;
        margin: 0;
        background-color: #090916;
        color: #cfcfcf;
        margin-right: 5px;
        margin-top: 10px;
        flex: 1;
    }

    .link {
        margin-top: 10px;
    }
</style>