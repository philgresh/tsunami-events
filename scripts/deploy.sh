#!/bin/bash
# A script that creates a release and deploys the app

if [ $# -eq 0 ]; then
    echo "No arguments provided"
    exit 1
fi

if [ -z "$1" ]; then
    echo "No release tag arg provided"
    exit 1
fi
release_tag="$1"

existing_tag="$(git tag -l $release_tag)"
if [ ! -z "$existing_tag" ]; then
    echo "Release tag $release_tag already in use; latest release was:
    $(gh release list --limit=1)"
    exit 1
fi

echo "Creating release $release_tag"

gh release create $release_tag --generate-notes
git fetch --tags origin

echo "Successfully created release, starting deploy"
firebase deploy -m "$release_tag: https://github.com/philgresh/tsunami-alert-gcp/releases/tag/$release_tag"

exit 0
