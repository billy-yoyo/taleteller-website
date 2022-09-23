<script lang="ts">
import { Router, Route, link } from "svelte-navigator";
import Login from "./components/auth/Login.svelte";
import Signup from "./components/auth/Signup.svelte";
import Dialogs from "./components/common/Dialogs.svelte";
import Editors from "./components/editors/Editors.svelte";
import Chat from "./components/message/Chat.svelte";
import ActionPage from "./routes/ActionPage.svelte";
import Backgrounds from "./routes/Backgrounds.svelte";
import CampaignPage from "./routes/CampaignPage.svelte";
import Campaigns from "./routes/Campaigns.svelte";
import CharactermancerPage from "./routes/CharactermancerPage.svelte";
import Characters from "./routes/Characters.svelte";
import CharacterSheetPage from "./routes/CharacterSheetPage.svelte";
import Classes from "./routes/Classes.svelte";
import ClassPage from "./routes/ClassPage.svelte";
import FeaturePage from "./routes/FeaturePage.svelte";
import Features from "./routes/Features.svelte";
import Home from "./routes/Home.svelte";
import ItemPage from "./routes/ItemPage.svelte";
import Items from "./routes/Items.svelte";
import Races from "./routes/Races.svelte";
import Spells from "./routes/Spells.svelte";
import UpgradeSetPage from "./routes/UpgradeSetPage.svelte";
</script>

<Router>
    <header>
        <div class="bar top">
            <div class="content">
                <a href="/" class="title" use:link><h1>Taleteller</h1></a>
            </div>
        </div>
        <div class="bar nav">
            <nav class="content">
                <a href="/characters" class="tab" use:link>Characters</a>
                <a href="/campaigns" class="tab" use:link>Campaigns</a>
                <a href="/races" class="tab" use:link>Races</a>
                <a href="/backgrounds" class="tab" use:link>Backgrounds</a>
                <a href="/classes" class="tab" use:link>Classes</a>
                <a href="/spells" class="tab" use:link>Spells</a>
                <a href="/items" class="tab" use:link>Items</a>
                <a href="/features" class="tab" use:link>Features</a>
            </nav>
        </div>
    </header>

    <Dialogs />
    <Editors />
    <Chat />

    <div class="bar main">
        <main class="content">
            <Route path="/">
                <Home />
            </Route>
            <Route path="/character/:id" let:params>
                <CharacterSheetPage id={params.id} />
            </Route>
            <Route path="/charactermancer/:id" let:params>
                <CharactermancerPage id={params.id} />
            </Route>
            <Route path="/class/:id" let:params>
                <ClassPage id={params.id} />
            </Route>
            <Route path="/class/:id/edit" let:params>
                <ClassPage id={params.id} editing={true} />
            </Route>
            <Route path="/upgradeSet/:id" let:params>
                <UpgradeSetPage id={params.id} />
            </Route>
            <Route path="/upgradeSet/:id/edit" let:params>
                <UpgradeSetPage id={params.id} editing={true} />
            </Route>
            <Route path="/campaign/:id" let:params>
                <CampaignPage id={params.id} />
            </Route>
            <Route path="/action/:id" let:params>
                <ActionPage id={params.id} />
            </Route>
            <Route path="/action/:id/edit" let:params>
                <ActionPage id={params.id} editing={true}/>
            </Route>
            <Route path="/item/:id" let:params>
                <ItemPage id={params.id} />
            </Route>
            <Route path="/item/:id/edit" let:params>
                <ItemPage id={params.id} editing={true}/>
            </Route>
            <Route path="/feature/:id" let:params>
                <FeaturePage id={params.id} />
            </Route>
            <Route path="/feature/:id/edit" let:params>
                <FeaturePage id={params.id} editing={true}/>
            </Route>
            <Route path="/login">
                <Login />
            </Route>
            <Route path="/signup">
                <Signup />
            </Route>
            <Route path="/characters">
                <Characters />
            </Route>
            <Route path="/campaigns">
                <Campaigns />
            </Route>
            <Route path="/races">
                <Races />
            </Route>
            <Route path="/backgrounds">
                <Backgrounds />
            </Route>
            <Route path="/classes">
                <Classes />
            </Route>
            <Route path="/spells">
                <Spells />
            </Route>
            <Route path="/items">
                <Items />
            </Route>
            <Route path="/features">
                <Features />
            </Route>
        </main>
    </div>

    <div class="bar footer">
        <div class="content">

        </div>

    </div>
</Router>

<style>
    .bar {
        width: 100%;
        display: flex;
        justify-content: center;
    }

    .content {
        width: 1080px;
    }

    @media only screen and (max-width: 1080px) {
        .content {
            width: 100%;
        }
    }

    .top {
        background-color: #06060a;
        color: #fdfdfd;
        border-bottom-style: solid;
        border-color: #4444a7;
        border-width: 2px;
        user-select: none;
    }

    .title {
        color: #fdfdfd;
        text-decoration: none;
    }

    .title:hover {
        text-decoration: none;
    }

    .nav {
        background-color: #0d0d15;
        font-weight: bold;
        padding: 10px 0px;
        border-bottom-style: solid;
        border-color: #27272f;
        border-width: 1px;
    }

    main {
        background-color: #1a1a23;
    }

    .tab {
        color: #cfcfcf !important;
        margin-right: 10px;
        user-select: none;
    }

    :global(body) {
        padding: 0;
        background-color: #1a1a23;
        color: #efefef;
    }
</style>