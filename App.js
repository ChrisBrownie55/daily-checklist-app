// colors: https://material.io/resources/color/#!/?view.left=0&view.right=0&secondary.color=1675d1&primary.color=512DA8

import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Switch,
  TextInput,
  Platform
} from 'react-native';
import Button from 'react-native-buttonex';
import FAB from 'react-native-fab';
import { MaterialIcons } from '@expo/vector-icons';

import useAsyncStorageJSON from './lib/use-async-storage-json';
import CheckBox from './components/CheckBox';
import Swipeable from 'react-native-swipeable';
import Touchable from './components/Touchable';

import { Audio } from 'expo-av';
import useInterval from './lib/use-interval';

const alarm = new Audio.Sound();
const loadingAlarmPromise = alarm.loadAsync(require('./assets/alarm.mp3'));

async function playAlarm() {
  await loadingAlarmPromise;
  await alarm.replayAsync();
}

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

function Task({
  title,
  timeLimit,
  done,
  onUpdate,
  isOpen,
  onToggleOpen,
  onRemoveTask
}) {
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
    onUpdate({
      title: newTitle,
      timeLimit: {
        active: isTimeLimitActive,
        minutes: timeLimitMinutes,
        startTime: timeLimit.startTime
      },
      done
    });

    if (isOpen) {
      onToggleOpen();
    }
  }
  const [isDeleting, setDeleting] = useState(false);

  function toggleDone() {
    let newDone;

    if (timeLimit.active) {
      if (done === 'indeterminate') {
        newDone = true;
      } else if (done === true) {
        newDone = false;
      } else {
        newDone = 'indeterminate';
      }
    } else {
      newDone = !done;
    }

    onUpdate({
      title,
      timeLimit: {
        ...timeLimit,
        startTime: Date.now()
      },
      done: newDone
    });
  }

  const [timer, setTimer] = useState(timeLimit.minutes);

  useEffect(() => {
    if (done === 'indeterminate' && timeLimit.startTime !== null) {
      if (timer <= 0) {
        // play alarm sound
        playAlarm();
        toggleDone();
        setTimer(timeLimit.minutes);
      } else {
        const timerID = setTimeout(() => {
          setTimer(
            timeLimit.minutes -
              Math.floor((Date.now() - timeLimit.startTime) / 60000)
          );
        }, 60000);

        return () => clearTimeout(timerID);
      }
    }
  }, [done, timer, timeLimit.minutes, timeLimit.startTime]);

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
      onRightActionRelease={onRemoveTask}
    >
      <View style={Task.styles.outerContainer}>
        <Touchable onPress={onToggleOpen}>
          <View style={Task.styles.innerContainer}>
            <CheckBox
              style={Task.styles.checkbox}
              checked={done}
              onPress={toggleDone}
            />
            <Text style={Task.styles.title}>{title}</Text>
            {timeLimit.active && (
              <Text
                style={{
                  ...Task.styles.timeLimit,
                  color: done === 'indeterminate' ? 'green' : 'black'
                }}
              >
                {done === 'indeterminate' ? timer : timeLimit.minutes} min
              </Text>
            )}
          </View>
        </Touchable>
        {isOpen && (
          <View style={Task.styles.editContainer}>
            <View style={Task.styles.titleSection}>
              <Text style={{ marginRight: 10 }}>Title</Text>
              <TextInput
                style={Task.styles.titleInput}
                onChangeText={setNewTitle}
                value={newTitle}
              />
            </View>
            <View style={Task.styles.timeLimitSection}>
              <Text style={{ marginRight: Platform.OS === 'ios' ? 10 : 5 }}>
                Time Limit
              </Text>
              <Switch
                value={isTimeLimitActive}
                onValueChange={() => setTimeLimitActive(!isTimeLimitActive)}
                thumbColor="#1976D2"
                trackColor={{ false: '#C4DEF8', true: '#84BAF0' }}
              />
              <View style={Task.styles.timeLimitActions}>
                <View
                  style={{
                    borderRadius: 100,
                    overflow: 'hidden',
                    marginRight: 5
                  }}
                >
                  <Touchable onPress={decrementTimeLimitMinutes}>
                    <View style={Task.styles.timeLimitAction}>
                      <MaterialIcons
                        color="white"
                        name="remove"
                        title="subtract one"
                      />
                    </View>
                  </Touchable>
                </View>
                <Text style={{ marginRight: 5 }}>{timeLimitMinutes} min</Text>
                <View style={{ borderRadius: 100, overflow: 'hidden' }}>
                  <Touchable onPress={incrementTimeLimitMinutes}>
                    <View style={Task.styles.timeLimitAction}>
                      <MaterialIcons color="white" name="add" title="add one" />
                    </View>
                  </Touchable>
                </View>
              </View>
            </View>
            <View style={Task.styles.actions}>
              <View style={{ marginRight: 10 }}>
                <Button
                  title="cancel"
                  onPress={cancel}
                  noBackground
                  color="#5E5E5E"
                >
                  CANCEL
                </Button>
              </View>
              <Button title="done" onPress={submitChange} color="#512CA8">
                DONE
              </Button>
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  timeLimitSection: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  timeLimitActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto'
  },
  timeLimitAction: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 26,
    height: 26,
    backgroundColor: '#1976D2',
    borderRadius: 100
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 25
  },
  titleInput: {
    borderBottomColor: '#1976D2',
    borderBottomWidth: 1,
    flex: 1
  }
});

/**
 * Returns the start of the day in milliseconds since unix epoch
 * @param {Date} date A date object that points to any point within a certain day
 */
function startOfDay(date) {
  return (
    date.getTime() -
    (date.getHours() * 60 * 60 * 1000 +
      date.getMinutes() * 60 * 1000 +
      date.getSeconds() * 1000 +
      date.getMilliseconds())
  );
}

export default function App() {
  const [tasks, setTasks, clearTasks] = useAsyncStorageJSON('tasks', []);
  const [openTaskIndex, setOpenTaskIndex] = useState(null);
  const [lastDayStart, setLastDayStart] = useAsyncStorageJSON(
    'last-day-start',
    startOfDay(new Date())
  );

  const resetTasksIfNewDay = useCallback(() => {
    const ONE_DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
    if (Date.now() - lastDayStart >= ONE_DAY_IN_MILLISECONDS) {
      setLastDayStart(startOfDay(new Date()));
      setTasks(tasks.map(task => ({ ...task, done: false })));
    }
  }, [lastDayStart, tasks]);

  // run once initially
  useEffect(resetTasksIfNewDay, []);
  useInterval(resetTasksIfNewDay, 10000);

  function newTask() {
    setOpenTaskIndex(tasks.length);
    setTasks([
      ...tasks,
      {
        title: 'Your Task',
        timeLimit: { active: false, minutes: 0, startTime: null },
        done: false
      }
    ]);
  }

  function removeTask(index) {
    setTasks([...tasks.slice(0, index), ...tasks.slice(index + 1)]);
  }

  function editTask(editedTask, index) {
    setTasks([...tasks.slice(0, index), editedTask, ...tasks.slice(index + 1)]);
  }

  return (
    <View style={App.styles.container}>
      <View>
        <Text style={App.styles.title}>Daily Checklist</Text>
      </View>
      <ScrollView>
        {tasks.map((task, index) => (
          <Task
            key={index}
            onUpdate={task => editTask(task, index)}
            isOpen={openTaskIndex === index}
            onToggleOpen={() =>
              setOpenTaskIndex(openTaskIndex === index ? null : index)
            }
            onRemoveTask={() => {
              removeTask(index);
              if (openTaskIndex === index) {
                setOpenTaskIndex(null);
              }
            }}
            {...task}
          />
        ))}
      </ScrollView>
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
