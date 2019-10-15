// colors: https://material.io/resources/color/#!/?view.left=0&view.right=0&secondary.color=1675d1&primary.color=512DA8

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import FAB from 'react-native-fab';
import { MaterialIcons } from '@expo/vector-icons';

import useAsyncStorageJSON from './lib/use-async-storage-json';
import CheckBox from './components/CheckBox';

function Task({ title, timeLimit, done, handleUpdate }) {
  return (
    <View>
      <CheckBox checked={done} />
      <Text>{title}</Text>
    </View>
  );
}

export default function App() {
  const [tasks, setTasks, clearTasks] = useAsyncStorageJSON('tasks', []);

  function newTask() {
    setTasks([
      ...tasks,
      { title: '', timeLimit: { active: false, minutes: 0 }, done: false }
    ]);
  }

  function removeTask(index) {
    setTasks([...tasks.slice(0, index), ...tasks.slice(index)]);
  }

  function editTask(editedTask, index) {
    setTasks([...tasks.slice(0, index), editedTask, ...tasks.slice(index)]);
  }

  return (
    <View style={styles.container}>
      <View>
        <Text>Daily Checklist</Text>
      </View>
      <View>
        {tasks.map((task, index) => (
          <Task
            key={index}
            handleUpdate={task => editTask(task, index)}
            {...task}
          />
        ))}
      </View>
      <FAB
        visible={true}
        buttonColor="#1976D2"
        iconTextColor="white"
        onClickAction={newTask}
        iconTextComponent={<MaterialIcons name="add" />}
      />
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
