'use strict';

const Generator = require('yeoman-generator');
const yosay = require('yosay');
const path = require('path');

module.exports = class extends Generator {
  async prompting() {
    this.log(yosay(`yO!`));

    const prompts = [
      {
        type: 'string',
        name: 'packageName',
        message: 'Package name',
        default: 'net.nineseventwo'
      }, {
        type: 'string',
        name: 'baseName',
        message: 'Base application name',
        default: 'sandbox'
      }, {
        type: 'string',
        name: 'serviceVersion',
        message: 'Service version',
        default: '1.0.0'
      }, {
        type: 'list',
        name: 'javaVersion',
        message: 'Java version',
        choices: [
          {
            name: 'Java 8',
            value: '1.8',
          }
        ]
      }, {
        type: 'list',
        name: 'springBootVersion',
        message: 'Spring Boot version:',
        choices: [
          {
            name: '1.5.18.RELEASE',
            value: '1.5.18.RELEASE'
          }
        ]
      }, {
        type: 'list',
        name: 'buildTool',
        message: 'Build tool',
        choices: [
          {
            name: 'Gradle',
            value: 'gradle',
          }, {
            name: 'Maven',
            value: 'maven'
          }
        ]
      }, {
        type: 'checkbox',
        name: 'opsComponents',
        message: 'Operation components:',
        choices: [
          {
            name: 'Actuator',
            value: 'actuator',
            checked: true
          }, {
            name: 'Actuator documentation',
            value: 'actuatorDocs',
            checked: false
          },
        ]
      }, {
        type: 'checkbox',
        name: 'coreComponents',
        message: 'Core components:',
        choices: [
         {
            name: 'Lombok',
            value: 'lombok',
            checked: true
          },
        ]
      }
    ];

    const props = await this.prompt(prompts);
    this.props = props;
  }

  writing() {
    const isSelected = function(components, componentName) {
      return components.indexOf(componentName) !== -1;
    };

    const packageTplPath = 'net/nineseventwo/template';
    const packagePath = path.join(this.props.packageName.replace(/\./g, '/'), this.props.baseName);
    const srcMainJavaPath = 'src/main/java';
    const srcMainResourcesPath = 'src/main/resources';
    const srcMainTestPath = 'src/test/java';

    //#region Components selection
    const actuatorSelected = isSelected(this.props.opsComponents, 'actuator');
    const actuatorDocsSelected = isSelected(this.props.opsComponents, 'actuatorDocs');

    const lombokSelected = isSelected(this.props.coreComponents, 'lombok');
    //#endregion

    const applicationContext = {
      packageName: this.props.packageName,
      baseName: this.props.baseName
    };

    this.fs.copy(
      this.templatePath('.gitignore'),
      this.destinationPath('.gitignore')
    );

    if (this.props.buildTool === 'gradle') {
      //#region Gradle
      const gradleWrapperPath = 'gradle/wrapper';
      const buildGradleContext = {
        packageName: this.props.packageName,
        baseName: this.props.baseName,
        serviceVersion: this.props.serviceVersion,
        javaVersion: this.props.javaVersion,
        springBootVersion: this.props.springBootVersion,
        actuator: actuatorSelected,
        actuatorDocs: actuatorDocsSelected,
        lombok: lombokSelected,
      };
      const settingsGradleContext = {
        packageName: this.props.packageName,
        baseName: this.props.baseName,
        serviceVersion: this.props.serviceVersion,
        javaVersion: this.props.javaVersion
      };

      this.fs.copyTpl(
        this.templatePath('build.gradle'),
        this.destinationPath('build.gradle'),
        buildGradleContext
      );

      this.fs.copyTpl(
        this.templatePath('settings.gradle'),
        this.destinationPath('settings.gradle'),
        settingsGradleContext
      );

      this.fs.copy(
        this.templatePath('gradlew'),
        this.destinationPath('gradlew')
      );

      this.fs.copy(
        this.templatePath('gradlew.bat'),
        this.destinationPath('gradlew.bat')
      );

      this.fs.copy(
        this.templatePath(path.join(gradleWrapperPath, 'gradle-wrapper.jar')),
        this.destinationPath(path.join(gradleWrapperPath, 'gradle-wrapper.jar'))
      );

      this.fs.copy(
        this.templatePath(path.join(gradleWrapperPath, 'gradle-wrapper.properties')),
        this.destinationPath(path.join(gradleWrapperPath, 'gradle-wrapper.properties'))
      );
      //#endregion
    } else {
      //#region Maven
      const mavenWrapperPath = '.mvn/wrapper';

      const buildMavenContext = {
        packageName: this.props.packageName,
        baseName: this.props.baseName,
        serviceVersion: this.props.serviceVersion,
        javaVersion: this.props.javaVersion,
        springBootVersion: this.props.springBootVersion,
        actuator: actuatorSelected,
        actuatorDocs: actuatorDocsSelected,
        lombok: lombokSelected,
      };

      this.fs.copyTpl(
        this.templatePath('pom.xml'),
        this.destinationPath('pom.xml'),
        buildMavenContext
      );

      this.fs.copy(
        this.templatePath('mvnw.cmd'),
        this.destinationPath('mvnw.cmd')
      );

      this.fs.copy(
        this.templatePath('mvnw'),
        this.destinationPath('mvnw')
      );

      this.fs.copy(
        this.templatePath(path.join(mavenWrapperPath, 'maven-wrapper.jar')),
        this.destinationPath(path.join(mavenWrapperPath, 'maven-wrapper.jar'))
      );

      this.fs.copy(
        this.templatePath(path.join(mavenWrapperPath, 'maven-wrapper.properties')),
        this.destinationPath(path.join(mavenWrapperPath, 'maven-wrapper.properties'))
      );
      //#endregion
    }

    this.fs.copyTpl(
      this.templatePath(path.join(srcMainJavaPath, packageTplPath, 'Application.java')),
      this.destinationPath(path.join(srcMainJavaPath, packagePath, 'Application.java')),
      applicationContext
    );

    this.fs.copy(
      this.templatePath(path.join(srcMainResourcesPath, 'application.yml')),
      this.destinationPath(path.join(srcMainResourcesPath, 'application.yml'))
    );

    this.fs.copyTpl(
      this.templatePath(path.join(srcMainTestPath, packageTplPath, 'ApplicationTests.java')),
      this.destinationPath(path.join(srcMainTestPath, packagePath, 'ApplicationTests.java')),
      applicationContext
    );
  }
};