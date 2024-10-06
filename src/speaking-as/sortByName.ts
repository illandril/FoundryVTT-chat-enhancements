type HasName = {
  name: string;
};

const sortByName = (option1: HasName, option2: HasName) => option1.name.localeCompare(option2.name);

export default sortByName;
