// colors: https://material.io/resources/color/#!/?view.left=0&view.right=0&secondary.color=1675d1&primary.color=512DA8

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableNativeFeedback,
  Button,
  Switch,
  TextInput
} from 'react-native';
import FAB from 'react-native-fab';
import { MaterialIcons } from '@expo/vector-icons';

import useAsyncStorageJSON from './lib/use-async-storage-json';
import CheckBox from './components/CheckBox';
import Swipeable from 'react-native-swipeable';

function useStateWithDefault(defaultValue) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (value !== defaultValue) {
      setValue(defaultValue);
    }
  }, [defaultValue]);

  function reset() {
    setValue(defaultValue);
  }

  return [value, setValue, reset];
}

function Task({ title, timeLimit, done, handleUpdate, isOpen, onToggleOpen }) {
  const [newTitle, setNewTitle, resetNewTitle] = useStateWithDefault(title);
  const [
    isTimeLimitActive,
    setTimeLimitActive,
    resetTimeLimitActive
  ] = useStateWithDefault(timeLimit.active);
  const [
    timeLimitMinutes,
    setTimeLimitMinutes,
    resetTimeLimitMinutes
  ] = useStateWithDefault(timeLimit.minutes);
  function incrementTimeLimitMinutes() {
    setTimeLimitMinutes(timeLimitMinutes + 1);
  }
  function decrementTimeLimitMinutes() {
    setTimeLimitMinutes(Math.max(0, timeLimitMinutes - 1));
  }

  function cancel() {
    resetNewTitle();
    resetTimeLimitActive();
    resetTimeLimitMinutes();

    if (isOpen) {
      onToggleOpen();
    }
  }

  function submitChange() {
    handleUpdate({
      title: newTitle,
      timeLimit: {
        active: isTimeLimitActive,
        minutes: timeLimitMinutes
      },
      done
    });
  }

  function toggleDone() {
    handleUpdate({
      title,
      timeLimit,
      done: !done
    });
  }

  const [isDeleting, setDeleting] = useState(false);

  return (
    <Swipeable
      rightContent={
        <View style={{ flex: 1, justifyContent: 'center', paddingLeft: 20 }}>
          <Text style={{ color: isDeleting ? '#1976D2' : 'lightgrey' }}>
            Remove item
          </Text>
        </View>
      }
      style={{ overflow: 'hidden' }}
      onRightActionActivate={() => setDeleting(true)}
      onRightActionDeactivate={() => setDeleting(false)}
      onRightActionRelease={() => console.log('Removing item')}
    >
      <View style={Task.styles.outerContainer}>
        <TouchableNativeFeedback onPress={onToggleOpen}>
          <View style={Task.styles.innerContainer}>
            <CheckBox
              style={Task.styles.checkbox}
              checked={done}
              onPress={toggleDone}
            />
            <Text style={Task.styles.title}>{title}</Text>
            {timeLimit.active && (
              <Text style={Task.styles.timeLimit}>{timeLimit.minutes} min</Text>
            )}
          </View>
        </TouchableNativeFeedback>
        {isOpen && (
          <View style={Task.styles.editContainer}>
            <View style={Task.styles.titleSection}>
              <Text>Title</Text>
              <TextInput onChangeText={setNewTitle} value={newTitle} />
            </View>
            <View style={Task.styles.timeLimitSection}>
              <Text>Time limit</Text>
              <Switch
                value={isTimeLimitActive}
                onValueChange={() => setTimeLimitActive(!isTimeLimitActive)}
              />
              <View></View>
            </View>
            <View style={Task.styles.actions}>
              <Button title="cancel" onPress={cancel}>
                CANCEL
              </Button>
              <Button title="done">DONE</Button>
            </View>
          </View>
        )}
      </View>
    </Swipeable>
  );
}

Task.styles = StyleSheet.create({
  outerContainer: {
    alignSelf: 'stretch',
    marginBottom: 10,
    backgroundColor: 'white',

    borderColor: '#ADD1F5',
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 8,

    shadowOpacity: 0.05,
    shadowRadius: 1,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowColor: '#125596',
    elevation: 1,

    overflow: 'hidden'
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',

    paddingVertical: 20,
    paddingHorizontal: 25
  },
  checkbox: {
    marginRight: 10
  },
  title: {},
  timeLimit: {
    marginLeft: 'auto'
  },

  editContainer: {
    paddingBottom: 20,
    paddingHorizontal: 30
  },
  titleSection: {
    flexDirection: 'row'
  },
  timeLimitSection: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  }
});

export default function App() {
  const [tasks, setTasks, clearTasks] = useAsyncStorageJSON('tasks', []);
  const [openTaskIndex, setOpenTaskIndex] = useState(null);

  function newTask() {
    setTasks([
      ...tasks,
      { title: 'Title', timeLimit: { active: false, minutes: 0 }, done: false }
    ]);
  }

  function removeTask(index) {
    setTasks([...tasks.slice(0, index), ...tasks.slice(index)]);
  }

  function editTask(editedTask, index) {
    setTasks([...tasks.slice(0, index), editedTask, ...tasks.slice(index)]);
  }

  return (
    <View style={App.styles.container}>
      <View>
        <Text style={App.styles.title}>Daily Checklist</Text>
      </View>
      <View>
        {tasks.map((task, index) => (
          <Task
            key={index}
            handleUpdate={task => editTask(task, index)}
            isOpen={openTaskIndex === index}
            onToggleOpen={() =>
              setOpenTaskIndex(openTaskIndex === index ? null : index)
            }
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

App.styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 45,
    paddingHorizontal: 30
  },
  title: {
    fontSize: 32,
    marginBottom: 40
  }
});
