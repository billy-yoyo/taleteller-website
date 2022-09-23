<script lang="ts">
import { Link, useNavigate } from "svelte-navigator";
import { login } from "../../repo/lib/authFetch";
import Field from "../common/Field.svelte";

let username: string;
let password: string;
let error: string = undefined;

const navigate = useNavigate();

const syncUsername = (e: CustomEvent<{ value: string}>) => {
    username = e.detail.value;
};

const syncPassword = (e: CustomEvent<{ value: string}>) => {
    password = e.detail.value;
};

const onLogin = async () => {
    error = '';
    const success = await login(username, password);
    password = '';
    if (success) {
        navigate('/');
    } else {
        error = 'Login failed. Username or password incorrect.';
    }
};
</script>

<div class="container">
    <div class="auth">
        <Field title="Username" type="string" fixedValue={username} on:change={syncUsername} on:submit={onLogin} editable fullwidth max={70}/>
        <Field title="Password" type="string" fixedValue={password} on:change={syncPassword} on:submit={onLogin} editable password fullwidth max={70}/>
        <div class="space"></div>
        {#if error !== undefined}
        <div class="error">
            {error}
        </div>
        {/if}
        <button on:click={onLogin}>Login</button>
        <div class="link">
            <Link to="/signup">Don't have an account? Click here to sign up.</Link>
        </div>
    </div>
</div>


<style>
    .container {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 400px;
    }

    .auth {
        display: flex;
        flex-direction: column;
        width: 400px;
        justify-content: center;
        align-items: center;
    }

    .error {
        margin-top: 10px;
        color: #c33;
    }

    .space {
        height: 20px;
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
        width: 100%;
    }

    .link {
        margin-top: 10px;
    }
</style>