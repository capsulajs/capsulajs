---
name: Change Request/New Feature Request
about: Suggest a change in exist feature or the creation of a new feature
title: ''
labels: 'feature'
assignees: ''
---

## General description
The general description of the change/feature, that will explain the core value and why it's needed.
#### Prerequisites
Links to any external dependency for this feature

## API

#### Design description

A clear and concise description of the design proposition.

- [ ] Is it backward compatible ?
- [ ] Adds new API
- [ ] Changes existing API
- [ ] Removes existing API

#### Changes

Provide link to a PR or code snippet of old and new API.

## Behavior

#### Consideration
List of everything to consider before writing test cases.

- [ ] Does the suggested changes impact the current behaviour ?
<!-- If yes, specify which behaviour will be changed and how or provide the link to a PR.-->
- [ ] Does the suggested changes are specific to some devices/browsers/environments
<!-- If yes, specify which devices/browsers/environments -->
- [ ] Does the suggested changes require to add new dependencies to the package ?
<!-- If yes, provide the list of dependencies and explain why it's required. -->

<!-- 
Describe the feature behavior the best you can using gherkin feature file 
Link to PR or Gherkin snippet
```gherkin
Given A great package
When I add a new feature
Then I expect it to work fine
```
-->

## Test cases

Link to the PR with test cases, that are written in _**[Gherkin Syntax](https://docs.cucumber.io/gherkin/reference/)**_ and cover all the possible scenarios.

## Key Performance Indicator (KPI) Definition

A clear target that can be measured by the change.

_**Example:** reduce bundle size by X%._

## Ready for implementation
- [ ] External dependencies have been resolved
- [ ] API has been approved
- [ ] Test cases have been prepared
- [ ] Discussed with Technical lead

## Definition of Done
- [ ] Maintainer review
- [ ] All tests are implemented <!-- automatic testing -->
- [ ] Manual QA
- [ ] Documentation
- [ ] Release notes
- [ ] KPI has been reached

## RoadMap

In case there is more than one mergeable point you can specify it here.

NOTICE that DoD is one unit, you CAN'T do implementation then notes then documentation etc.
