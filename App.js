// colors: https://material.io/resources/color/#!/?view.left=0&view.right=0&secondary.color=1675d1&primary.color=512DA8

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import useAsyncStorageJSON from './lib/use-async-storage-json';

function Task() {
  return null;
}

export default function App() {
  const [tasks, setTasks, clearTasks] = useAsyncStorageJSON('tasks', []);

  console.log('Tasks', tasks);

  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      {tasks.map(data => (
        <Task />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
