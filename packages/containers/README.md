# JS containers - CapsulaJS
## Intro
The need for JS containers is derived from browsers run time. For NodeJS docker provide a good solution and reach ecosystem. But those are useless for browsers not only because the run time is not supporting docker, actually the need are completely different. 

> Actually the name CapsulaJS derived from this need.
Docker named after Containers (the one that you see in ports) and helps deliver "heavy" payload (servers), here we have much more delicate payload and sensitive delivery, and hence we need "CapsulaJS"

## Background
**Why do we need containers?**
We want to share run time environment in insulated manner

**Don't we already doing it**
Maybe we are but we don't have a standard, like Docker not really invent the Linux containers and it actually exist since the Unix days. But each one was doing it's own thing what created lots of waste and block collaboration.
Worse then that most people are using **bundlers** to solve this issue. The main problem is that those bundles are not composable or compatible in anyway, what force you bundle everything with the same bundler witch create lot's of problem and limitation. 
You might think the native insulation of browsers can solve the problem, but it's leads for duplication and complexity because it completely insulate. You may consider to give up on insulation but then it's means you back to using "Window", witch leads to set of problems and why we don't do it anymore

## Use cases
**Shared data**
You might need to share data across all your modules in a container but you want it to be contain in container scope and not shared across all the containers (like window does)

**Configuration**
Like in many other ecosystems it vary useful to use environment variable for certain configuration that usually must be evaluate during container start time. If we evaluate those during build time it's create limitation because we won't be able to change those without build again meaning we will have to build and deploy again

**Shared dependencies**
Share dependencies create for us a big problem. Unlike server side containers the size of our containers is critical. We can't use bundler to solve this issue because it will couple all of our packages at build time and to the bundler. We will also have the challenge not to break the bundler, linters, IDE or any other tool that might wander where the dependency goon. We have 2 options to share a dependency: new instance of a module meaning it will be fresh without any state just for out container but it's might be expensive like in case that we run something "heavy" (like Angular, React, Vue)  in this case we probably want to give the container an existing instance of a module. But still it's better not to put it into the window because we might have conflicts. We need also to think about versions and aliasing, example we might want some of our packages to get React 15.X and some 16.x but when including we just want to include "React"

**Interaction between containers**
We want to enable interaction without coupling, this extremely important especially with the JS nature of error handling when parse error or handle error can break all of the application. In server side it's much more simple because just need to manage the container ports and the interaction happening over TCP UDP according to application requirement. In our case we don't have standard. Probably events/post messages are the closes thing we have. We need to consider the case we running in web worker, iframe or the main thread. routing those event/message support to be easy inside the container but routing messages between containers going to be a challenge. 

> **NOTE** we want to focus on the container itself as a stand alone solution and not side track into bundlers, package manager, transpiler, browser etc  territory. It's important to use standard when ever it's available.