import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  ScrollView,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";

export default function App() {
  const [text, setText] = useState("");
  const [texts, setTexts] = useState([]);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [updatetext, setupdatetext] = useState(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    loadTasks();

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    saveTasks();
  }, [texts]);

  const saveTasks = async () => {
    try {
      await AsyncStorage.setItem("@todoApp_tasks", JSON.stringify(texts));
    } catch (error) {
      console.error("Error saving tasks:", error);
    }
  };

  const deleteTask = (index) => {
    const updatedTexts = [...texts];
    updatedTexts.splice(index, 1);
    setTexts(updatedTexts);
  };

  const donefunction = (index) => {
    const updatedTexts = [...texts];
    updatedTexts[index].done = !updatedTexts[index].done;
    setTexts(updatedTexts);
  };

  const updatefunction = (index) => {
    setText(texts[index].text);
    setupdatetext(index);
  };

  const loadTasks = async () => {
    try {
      const savedTasks = await AsyncStorage.getItem("@todoApp_tasks");
      if (savedTasks !== null) {
        const loadedTasks = JSON.parse(savedTasks);

        const tasksWithDefaultDone = loadedTasks.map((task) => ({
          ...task,
          done: task.done || false,
        }));
        setTexts(tasksWithDefaultDone);
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  };

  function addTask() {
    if (text.trim() !== "") {
      if (updatetext !== null) {
        const updatedTexts = [...texts];
        updatedTexts[updatetext].text = text;
        setTexts(updatedTexts);
        setupdatetext(null);
      } else {
        setTexts([...texts, { text, done: false }]);
      }
      setText("");
    }
  }

  function clearTasks() {
    setTexts([]);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.display, keyboardVisible && { marginBottom: 50 }]}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          {texts.map((task, index) => (
            <View key={index} style={styles.taskContainer}>
              <Text style={[styles.taskText, task.done && styles.doneText]}>
                • {task.text}
              </Text>
              <TouchableOpacity
                style={styles.deleteText}
                onPress={() => deleteTask(index)}
              >
                <Feather name="trash-2" size={18} color="grey" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.updatedTexts}
                onPress={() => updatefunction(index)}
              >
                <Feather name="edit" size={18} color="grey" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.done}
                onPress={() => donefunction(index)}
              >
                <Feather name="check-circle" size={18} color="grey" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
      <View style={styles.buttonContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type"
          placeholderTextColor="grey"
          onChangeText={setText}
          value={text}
        />
        <TouchableOpacity style={styles.button} onPress={addTask}>
          <Text style={styles.buttonText}>
            {updatetext !== null ? "Update" : "Add"}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.clear} onPress={clearTasks}>
        <Text style={{ color: "grey" }}>Clear</Text>
      </TouchableOpacity>

      <StatusBar style="auto" />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 50,
    paddingHorizontal: 20,
  },
  input: {
    flex: 1,
    marginRight: 5,
    borderRadius: 5,
    borderWidth: 1,
    color: "grey",
    fontSize: 18,
    paddingHorizontal: 10,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginLeft: 10,
    borderRadius: 10,
    borderWidth: 0.1,
    borderColor: "grey",
  },
  buttonText: {
    color: "grey",
  },
  display: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  scrollViewContent: {
    paddingVertical: 10,
    width: "100%",
  },
  taskText: {
    color: "white",
    marginBottom: 8,
    fontSize: 18,
    flex: 1,
    flexWrap: "wrap",
    marginRight: 50,
  },
  doneText: {
    textDecorationLine: "line-through",
    color: "grey",
  },
  taskContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  deleteText: {
    marginLeft: 10,
  },
  updatedTexts: {
    marginLeft: 10,
  },
  clear: {
    position: "absolute",
    top: 30,
    right: 20,
    zIndex: 1,
  },
  done: {
    marginLeft: 10,
  },
});
